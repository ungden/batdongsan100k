-- Bootstrap project_price_history with 13 monthly snapshots interpolated
-- from launch_price → avg_price_per_sqm. Lets the 12M trend column show
-- meaningful data immediately. Will be overwritten by real daily snapshots
-- once the recompute-intel cron job runs.

-- Generate snapshots for the last 13 months for projects that have both
-- launch_price (price/m² at launch) and current avg_price_per_sqm.

WITH base AS (
  SELECT
    id,
    -- Treat launch_price as price/m² (matches existing seed semantics in 20260404095605)
    launch_price::NUMERIC AS launch_psqm,
    avg_price_per_sqm::NUMERIC AS current_psqm,
    completion_date
  FROM public.projects
  WHERE launch_price IS NOT NULL
    AND launch_price > 0
    AND avg_price_per_sqm IS NOT NULL
    AND avg_price_per_sqm > 0
),
months AS (
  SELECT generate_series(0, 12) AS m_ago
)
INSERT INTO public.project_price_history (project_id, snapshot_date, avg_price_per_sqm, sample_size, source)
SELECT
  b.id,
  (CURRENT_DATE - (m.m_ago * INTERVAL '1 month'))::DATE,
  -- Linear interpolation in log space for nicer-looking growth curve
  ROUND(
    EXP(
      LN(GREATEST(b.launch_psqm, 1))
      + (LN(GREATEST(b.current_psqm, 1)) - LN(GREATEST(b.launch_psqm, 1)))
        * (1.0 - m.m_ago / 12.0)
    )
  )::BIGINT,
  0,
  'computed'
FROM base b
CROSS JOIN months m
ON CONFLICT (project_id, snapshot_date) DO NOTHING;
