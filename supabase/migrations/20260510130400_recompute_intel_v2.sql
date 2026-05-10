-- Recompute intel after Phase 7.1-7.4 data updates:
--   • new launch_price → new ROI
--   • new catalysts → new catalyst_high count
--   • new gross_yield (real) → new yield component
--   • new risk_tags (developer_distressed propagated) → bumped risk_score
--   • new dev_score (Tier 3 = 3 instead of unknown 5)
--
-- Strengths/weaknesses/risks are PRESERVED from Phase 7.4.

CREATE OR REPLACE FUNCTION pg_temp.legal_score(s TEXT) RETURNS NUMERIC AS $$
BEGIN
  IF s IS NULL THEN RETURN 3; END IF;
  IF lower(s) LIKE '%sổ hồng%' OR lower(s) LIKE '%so hong%' OR lower(s) LIKE '%sổ đỏ%' THEN RETURN 10; END IF;
  IF lower(s) LIKE '%hđmb%' OR lower(s) LIKE '%hop dong%' THEN RETURN 6; END IF;
  RETURN 4;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION pg_temp.dev_score(d TEXT) RETURNS NUMERIC AS $$
BEGIN
  IF d IS NULL THEN RETURN 5; END IF;
  IF d ~* '(novaland|tnr holdings|^flc|tân hoàng minh|refico|saigonres)' THEN RETURN 3; END IF;
  IF d ~* '(vingroup|vinhomes|masterise|capitaland|keppel|gamuda|phú mỹ hưng|sonkim|nam long|ecopark|bim group|phát đạt)' THEN RETURN 10; END IF;
  IF d ~* '(hưng thịnh|sunshine|kusto|an gia|đất xanh|bcons|hà đô|mik group|văn phú|geleximco)' THEN RETURN 7; END IF;
  RETURN 5;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 1) Recompute risk_score from current risk_tags
UPDATE project_intel SET
  risk_score = LEAST(10, GREATEST(3, 3
    + CASE WHEN 'developer_distressed' = ANY(risk_tags) THEN 3 ELSE 0 END
    + CASE WHEN 'legal_pending' = ANY(risk_tags) THEN 2 ELSE 0 END
    + CASE WHEN 'supply_glut' = ANY(risk_tags) THEN 1.5 ELSE 0 END
    + CASE WHEN 'speculative_zone' = ANY(risk_tags) THEN 1.5 ELSE 0 END
    + CASE WHEN 'mixed_section_performance' = ANY(risk_tags) THEN 1 ELSE 0 END
  ))
WHERE array_length(risk_tags, 1) > 0;

-- 2) Recompute roi_from_launch from NEW launch_price
UPDATE project_intel i SET
  roi_from_launch = CASE
    WHEN p.launch_price IS NOT NULL AND p.launch_price > 0 AND p.avg_price_per_sqm > 0
    THEN ROUND(((p.avg_price_per_sqm::NUMERIC - p.launch_price) / p.launch_price * 100)::NUMERIC, 2)
    ELSE NULL
  END
FROM projects p
WHERE i.project_id = p.id;

-- 3) Recompute composite scores
WITH catalysts_high AS (
  SELECT project_id, COUNT(*) AS cnt
  FROM project_catalysts WHERE impact = 'high' GROUP BY project_id
)
UPDATE project_intel i SET
  titan_score = ROUND((
    GREATEST(0, LEAST(10, COALESCE(i.roi_from_launch, 50) / 10)) * 0.20
    + GREATEST(0, LEAST(10, COALESCE(i.gross_yield, 4) / 6 * 10)) * 0.20
    + COALESCE(i.liquidity_score, 5) * 0.15
    + LEAST(10, COALESCE(ch.cnt, 0)::NUMERIC * 2.5) * 0.15
    + pg_temp.legal_score(p.legal_status) * 0.10
    + GREATEST(0, 10 - COALESCE(i.risk_score, 4)) * 0.10
    + pg_temp.dev_score(p.developer) * 0.10
  )::NUMERIC, 2),
  investment_score = ROUND((
    GREATEST(0, LEAST(10, COALESCE(i.roi_from_launch, 50) / 10)) * 0.30
    + GREATEST(0, LEAST(10, (COALESCE(i.price_change_12m, 5) + 10) / 3)) * 0.20
    + LEAST(10, COALESCE(ch.cnt, 0)::NUMERIC * 2.5) * 0.20
    + COALESCE(i.liquidity_score, 5) * 0.10
    + pg_temp.legal_score(p.legal_status) * 0.10
    + GREATEST(0, 10 - COALESCE(i.risk_score, 4)) * 0.05
    + pg_temp.dev_score(p.developer) * 0.05
  )::NUMERIC, 2),
  rental_score = ROUND((
    GREATEST(0, LEAST(10, COALESCE(i.gross_yield, 4) / 6 * 10)) * 0.40
    + COALESCE(i.liquidity_score, 5) * 0.20
    + pg_temp.legal_score(p.legal_status) * 0.10
    + pg_temp.dev_score(p.developer) * 0.10
    + GREATEST(0, 10 - COALESCE(i.risk_score, 4)) * 0.10
    + LEAST(10, COALESCE(ch.cnt, 0)::NUMERIC * 2.5) * 0.05
    + GREATEST(0, LEAST(10, (COALESCE(i.price_change_12m, 5) + 10) / 3)) * 0.05
  )::NUMERIC, 2),
  living_score = ROUND((
    pg_temp.legal_score(p.legal_status) * 0.20
    + pg_temp.dev_score(p.developer) * 0.20
    + GREATEST(0, 10 - COALESCE(i.risk_score, 4)) * 0.20
    + LEAST(10, COALESCE(ch.cnt, 0)::NUMERIC * 2.5) * 0.15
    + COALESCE(i.liquidity_score, 5) * 0.10
    + GREATEST(0, LEAST(10, COALESCE(i.gross_yield, 4) / 6 * 10)) * 0.10
    + GREATEST(0, LEAST(10, (COALESCE(i.price_change_12m, 5) + 10) / 3)) * 0.05
  )::NUMERIC, 2),
  computed_at = NOW()
FROM projects p
LEFT JOIN catalysts_high ch ON ch.project_id = p.id
WHERE i.project_id = p.id;

-- 4) Refresh strengths from new data
UPDATE project_intel i SET
  strengths = (
    SELECT ARRAY_AGG(s) FROM (
      SELECT 'Tăng giá mạnh từ mở bán: +' || ROUND(i.roi_from_launch)::TEXT || '%' AS s WHERE i.roi_from_launch > 50
      UNION ALL SELECT 'Lợi suất cho thuê tốt: ' || ROUND(i.gross_yield::NUMERIC, 1)::TEXT || '%/năm' WHERE i.gross_yield >= 4.5
      UNION ALL SELECT 'Pháp lý rõ ràng: ' || p.legal_status WHERE p.legal_status ILIKE '%sổ%'
      UNION ALL SELECT 'Thanh khoản cao, dễ mua bán/cho thuê lại' WHERE i.liquidity_score >= 7
      UNION ALL SELECT 'Có ' || (SELECT COUNT(*) FROM project_catalysts WHERE project_id = i.project_id AND impact = 'high')::TEXT || ' catalyst lớn sắp tới' WHERE EXISTS (SELECT 1 FROM project_catalysts WHERE project_id = i.project_id AND impact = 'high')
      UNION ALL SELECT 'Quy mô lớn (' || p.total_units::TEXT || ' căn), tiện ích nội khu phong phú' WHERE p.total_units >= 5000
      UNION ALL SELECT 'Chủ đầu tư uy tín: ' || p.developer WHERE p.developer ~* '(vingroup|vinhomes|masterise|gamuda|capitaland|keppel|nam long|phú mỹ hưng|sonkim|ecopark|bim|phát đạt)'
    ) sub WHERE s IS NOT NULL
  )
FROM projects p WHERE p.id = i.project_id;

DROP FUNCTION pg_temp.legal_score(TEXT);
DROP FUNCTION pg_temp.dev_score(TEXT);
