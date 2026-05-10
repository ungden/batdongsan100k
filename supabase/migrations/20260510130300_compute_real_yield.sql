-- Compute REAL gross_yield from listing data instead of manual seed.
-- Median rent/m² × 12 / median sale/m² = annual gross yield.
-- Applied to every project with ≥2 active sale and ≥2 active rent listings.

WITH rent_stats AS (
  SELECT project_id,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price/NULLIF(area,0)) AS median_rent_per_sqm
  FROM properties
  WHERE project_id IS NOT NULL AND status = 'published' AND category = 'rent'
    AND price BETWEEN 3000000 AND 100000000   -- 3tr–100tr/month sanity
    AND area BETWEEN 25 AND 250
  GROUP BY project_id
  HAVING COUNT(*) >= 2
),
sale_stats AS (
  SELECT project_id,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price/NULLIF(area,0)) AS median_sale_per_sqm
  FROM properties
  WHERE project_id IS NOT NULL AND status = 'published' AND category = 'sale'
    AND price BETWEEN 800000000 AND 50000000000  -- 800tr–50 tỷ
    AND area BETWEEN 25 AND 250
  GROUP BY project_id
  HAVING COUNT(*) >= 2
),
yields AS (
  SELECT r.project_id,
    ROUND(((r.median_rent_per_sqm * 12) / s.median_sale_per_sqm * 100)::NUMERIC, 2) AS computed_yield
  FROM rent_stats r JOIN sale_stats s ON r.project_id = s.project_id
  WHERE s.median_sale_per_sqm > 0
)
UPDATE project_intel SET
  gross_yield = y.computed_yield,
  net_yield = ROUND((y.computed_yield * 0.75)::NUMERIC, 2)
FROM yields y
WHERE project_intel.project_id = y.project_id
  AND y.computed_yield BETWEEN 1.5 AND 12;  -- skip outliers

-- Mirror to projects.rental_yield to keep both columns in sync (used by narrative templates)
UPDATE projects SET rental_yield = i.gross_yield
FROM project_intel i
WHERE projects.id = i.project_id AND i.gross_yield IS NOT NULL;
