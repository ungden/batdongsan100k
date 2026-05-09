-- Bootstrap project_intel with SQL-computed values so the upgraded
-- Market Overview table has data on first deploy. The /api/jobs/recompute-intel
-- endpoint (or cron) will overwrite with the full TypeScript scoring engine.

-- Helper for liquidity bucket → 0..10
CREATE OR REPLACE FUNCTION pg_temp.liq_score(active_count INT, total_units INT)
RETURNS NUMERIC AS $$
DECLARE
  raw NUMERIC;
  bonus NUMERIC := 0;
  ratio NUMERIC;
BEGIN
  IF active_count IS NULL OR active_count = 0 THEN RETURN 0; END IF;
  raw := LOG(active_count + 1) * 5;
  IF total_units IS NOT NULL AND total_units > 0 THEN
    ratio := active_count::NUMERIC / total_units;
    IF ratio > 0.01 AND ratio < 0.05 THEN bonus := 1; END IF;
  END IF;
  RETURN GREATEST(0, LEAST(10, ROUND((raw + bonus)::NUMERIC, 2)));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper for legal score
CREATE OR REPLACE FUNCTION pg_temp.legal_score(s TEXT) RETURNS NUMERIC AS $$
BEGIN
  IF s IS NULL THEN RETURN 3; END IF;
  IF lower(s) LIKE '%sổ hồng%' OR lower(s) LIKE '%so hong%' OR lower(s) LIKE '%sổ đỏ%' THEN RETURN 10; END IF;
  IF lower(s) LIKE '%hđmb%' OR lower(s) LIKE '%hop dong%' THEN RETURN 6; END IF;
  RETURN 4;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Helper for developer tier score
CREATE OR REPLACE FUNCTION pg_temp.dev_score(d TEXT) RETURNS NUMERIC AS $$
BEGIN
  IF d IS NULL THEN RETURN 5; END IF;
  IF d ~* '(vingroup|vinhomes|masterise|capitaland|keppel|gamuda|phú mỹ hưng|sonkim|nam long)' THEN RETURN 10; END IF;
  IF d ~* '(novaland|hưng thịnh|sunshine|tnr|kusto|an gia)' THEN RETURN 7; END IF;
  RETURN 5;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Compute and upsert intel for all projects
WITH counts AS (
  SELECT
    p.id AS project_id,
    COUNT(*) FILTER (WHERE pr.category = 'sale') AS active_sale,
    COUNT(*) FILTER (WHERE pr.category = 'rent') AS active_rent
  FROM public.projects p
  LEFT JOIN public.properties pr ON pr.project_id = p.id AND pr.status = 'published'
  GROUP BY p.id
),
catalysts_high AS (
  SELECT project_id, COUNT(*) AS cnt
  FROM public.project_catalysts
  WHERE impact = 'high'
  GROUP BY project_id
),
calc AS (
  SELECT
    p.id AS project_id,
    p.legal_status,
    p.developer,
    p.rental_yield,
    p.total_units,
    p.completion_date,
    p.launch_price,
    p.avg_price_per_sqm,
    -- ROI from launch (using avg_price_per_sqm as proxy for current)
    CASE WHEN p.launch_price IS NOT NULL AND p.launch_price > 0 AND p.avg_price_per_sqm > 0
         THEN ROUND(((p.avg_price_per_sqm::NUMERIC - p.launch_price) / p.launch_price * 100)::NUMERIC, 2)
         ELSE NULL END AS roi_from_launch,
    -- Active counts
    COALESCE(c.active_sale, 0) AS active_sale,
    COALESCE(c.active_rent, 0) AS active_rent,
    -- Catalyst high count
    COALESCE(ch.cnt, 0)::INT AS catalyst_high
  FROM public.projects p
  LEFT JOIN counts c ON c.project_id = p.id
  LEFT JOIN catalysts_high ch ON ch.project_id = p.id
),
intel_calc AS (
  SELECT
    project_id,
    roi_from_launch,
    -- 12m change: from bootstrap price_history, prefer to compute via subquery
    (SELECT
       CASE WHEN h_old.avg_price_per_sqm IS NOT NULL AND h_old.avg_price_per_sqm > 0
            THEN ROUND(((h_now.avg_price_per_sqm::NUMERIC - h_old.avg_price_per_sqm) / h_old.avg_price_per_sqm * 100)::NUMERIC, 2)
            ELSE NULL END
     FROM (
       SELECT avg_price_per_sqm FROM public.project_price_history
       WHERE project_id = c.project_id ORDER BY snapshot_date DESC LIMIT 1
     ) h_now,
     (
       SELECT avg_price_per_sqm FROM public.project_price_history
       WHERE project_id = c.project_id
         AND snapshot_date <= CURRENT_DATE - INTERVAL '12 months'
       ORDER BY snapshot_date DESC LIMIT 1
     ) h_old
    ) AS price_change_12m,
    rental_yield AS gross_yield,
    CASE WHEN rental_yield IS NOT NULL THEN ROUND((rental_yield * 0.75)::NUMERIC, 2) ELSE NULL END AS net_yield,
    active_sale,
    active_rent,
    pg_temp.liq_score(active_sale + active_rent, total_units) AS liquidity_score,
    catalyst_high,
    -- Risk
    LEAST(10, GREATEST(0,
      3
      + CASE WHEN active_sale > 50 THEN 1.5 ELSE 0 END
      + CASE WHEN legal_status IS NULL OR (lower(legal_status) NOT LIKE '%sổ%' AND lower(legal_status) NOT LIKE '%so %')
             THEN 1.5 ELSE 0 END
    )) AS risk_score,
    legal_status,
    developer
  FROM calc c
)
INSERT INTO public.project_intel (
  project_id,
  roi_from_launch,
  price_change_12m,
  gross_yield,
  net_yield,
  active_sale_listings,
  active_rent_listings,
  liquidity_score,
  risk_score,
  risk_tags,
  titan_score,
  investment_score,
  rental_score,
  living_score,
  score_breakdown,
  computed_at
)
SELECT
  ic.project_id,
  ic.roi_from_launch,
  ic.price_change_12m,
  ic.gross_yield,
  ic.net_yield,
  ic.active_sale,
  ic.active_rent,
  ic.liquidity_score,
  ic.risk_score,
  ARRAY[]::TEXT[],
  -- Titan score: weighted blend
  ROUND((
    GREATEST(0, LEAST(10, COALESCE(ic.roi_from_launch, 50) / 10))   * 0.20
    + GREATEST(0, LEAST(10, COALESCE(ic.gross_yield, 4) / 6 * 10))   * 0.20
    + COALESCE(ic.liquidity_score, 5)                                * 0.15
    + LEAST(10, ic.catalyst_high * 2.5)                              * 0.15
    + pg_temp.legal_score(ic.legal_status)                           * 0.10
    + GREATEST(0, 10 - COALESCE(ic.risk_score, 4))                   * 0.10
    + pg_temp.dev_score(ic.developer)                                * 0.10
  )::NUMERIC, 2),
  -- Investment score: weight ROI + catalyst
  ROUND((
    GREATEST(0, LEAST(10, COALESCE(ic.roi_from_launch, 50) / 10))   * 0.30
    + GREATEST(0, LEAST(10, (COALESCE(ic.price_change_12m, 5) + 10) / 3)) * 0.20
    + LEAST(10, ic.catalyst_high * 2.5)                              * 0.20
    + COALESCE(ic.liquidity_score, 5)                                * 0.10
    + pg_temp.legal_score(ic.legal_status)                           * 0.10
    + GREATEST(0, 10 - COALESCE(ic.risk_score, 4))                   * 0.05
    + pg_temp.dev_score(ic.developer)                                * 0.05
  )::NUMERIC, 2),
  -- Rental score
  ROUND((
    GREATEST(0, LEAST(10, COALESCE(ic.gross_yield, 4) / 6 * 10))     * 0.40
    + COALESCE(ic.liquidity_score, 5)                                * 0.20
    + pg_temp.legal_score(ic.legal_status)                           * 0.10
    + pg_temp.dev_score(ic.developer)                                * 0.10
    + GREATEST(0, 10 - COALESCE(ic.risk_score, 4))                   * 0.10
    + LEAST(10, ic.catalyst_high * 2.5)                              * 0.05
    + GREATEST(0, LEAST(10, (COALESCE(ic.price_change_12m, 5) + 10) / 3)) * 0.05
  )::NUMERIC, 2),
  -- Living score
  ROUND((
    pg_temp.legal_score(ic.legal_status)                             * 0.20
    + pg_temp.dev_score(ic.developer)                                * 0.20
    + GREATEST(0, 10 - COALESCE(ic.risk_score, 4))                   * 0.20
    + LEAST(10, ic.catalyst_high * 2.5)                              * 0.15
    + COALESCE(ic.liquidity_score, 5)                                * 0.10
    + GREATEST(0, LEAST(10, COALESCE(ic.gross_yield, 4) / 6 * 10))   * 0.10
    + GREATEST(0, LEAST(10, (COALESCE(ic.price_change_12m, 5) + 10) / 3)) * 0.05
  )::NUMERIC, 2),
  '{}'::jsonb,
  NOW()
FROM intel_calc ic
ON CONFLICT (project_id) DO UPDATE SET
  roi_from_launch = EXCLUDED.roi_from_launch,
  price_change_12m = EXCLUDED.price_change_12m,
  gross_yield = EXCLUDED.gross_yield,
  net_yield = EXCLUDED.net_yield,
  active_sale_listings = EXCLUDED.active_sale_listings,
  active_rent_listings = EXCLUDED.active_rent_listings,
  liquidity_score = EXCLUDED.liquidity_score,
  risk_score = EXCLUDED.risk_score,
  titan_score = EXCLUDED.titan_score,
  investment_score = EXCLUDED.investment_score,
  rental_score = EXCLUDED.rental_score,
  living_score = EXCLUDED.living_score,
  computed_at = NOW();

-- Cleanup helpers
DROP FUNCTION pg_temp.liq_score(INT, INT);
DROP FUNCTION pg_temp.legal_score(TEXT);
DROP FUNCTION pg_temp.dev_score(TEXT);
