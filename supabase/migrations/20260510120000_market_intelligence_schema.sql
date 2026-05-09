-- Market Intelligence schema: price history, catalyst events, intel snapshot
-- Powers the upgraded /market-overview page (Project Intelligence Table + AI Deep Research panel)

-- ============================================================
-- 1) Price history (snapshot daily / weekly)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_price_history (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL,
  avg_price_per_sqm BIGINT,
  median_price_per_sqm BIGINT,
  sample_size INT DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'computed', -- computed | crawled | manual
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (project_id, snapshot_date)
);

CREATE INDEX IF NOT EXISTS idx_price_history_project_date
  ON public.project_price_history (project_id, snapshot_date DESC);

ALTER TABLE public.project_price_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "price_history_public_read" ON public.project_price_history
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "price_history_service_write" ON public.project_price_history
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2) Catalyst events (hạ tầng, pháp lý, kinh tế khu vực, thương mại)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_catalysts (
  id BIGSERIAL PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('infrastructure','legal','economic','commercial')),
  impact TEXT NOT NULL CHECK (impact IN ('high','medium','low')),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','rumor','speculative')),
  horizon TEXT NOT NULL CHECK (horizon IN ('short','medium','long')), -- 0-12m | 1-3y | 3-5y
  expected_date DATE,
  source_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_catalysts_project_date
  ON public.project_catalysts (project_id, expected_date);

CREATE INDEX IF NOT EXISTS idx_catalysts_impact
  ON public.project_catalysts (project_id, impact);

ALTER TABLE public.project_catalysts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "catalysts_public_read" ON public.project_catalysts
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "catalysts_service_write" ON public.project_catalysts
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3) Intel snapshot (cached scoring per project)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.project_intel (
  project_id UUID PRIMARY KEY REFERENCES public.projects(id) ON DELETE CASCADE,
  -- Price metrics (%)
  price_change_1m NUMERIC,
  price_change_6m NUMERIC,
  price_change_12m NUMERIC,
  roi_from_launch NUMERIC,
  cagr_since_launch NUMERIC,
  -- Yield (mirror from projects.rental_yield + computed)
  gross_yield NUMERIC,
  net_yield NUMERIC,
  -- Liquidity
  active_sale_listings INT DEFAULT 0,
  active_rent_listings INT DEFAULT 0,
  avg_days_on_market INT,
  liquidity_score NUMERIC, -- 0..10
  -- Risk
  risk_score NUMERIC, -- 0..10 (cao = rủi ro cao)
  risk_tags TEXT[] DEFAULT '{}',
  -- AI narrative
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  risks TEXT[] DEFAULT '{}',
  -- Composite scores (0..10)
  titan_score NUMERIC,
  living_score NUMERIC,
  investment_score NUMERIC,
  rental_score NUMERIC,
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_intel_titan_score
  ON public.project_intel (titan_score DESC NULLS LAST);

ALTER TABLE public.project_intel ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "intel_public_read" ON public.project_intel
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "intel_service_write" ON public.project_intel
    FOR ALL USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 4) Convenience view: projects + intel joined for fast list
-- ============================================================
CREATE OR REPLACE VIEW public.v_projects_with_intel AS
SELECT
  p.*,
  i.price_change_1m,
  i.price_change_6m,
  i.price_change_12m,
  i.roi_from_launch,
  i.cagr_since_launch,
  i.gross_yield AS intel_gross_yield,
  i.net_yield,
  i.active_sale_listings,
  i.active_rent_listings,
  i.avg_days_on_market,
  i.liquidity_score,
  i.risk_score,
  i.risk_tags,
  i.strengths,
  i.weaknesses,
  i.risks,
  i.titan_score,
  i.living_score,
  i.investment_score,
  i.rental_score,
  i.score_breakdown,
  i.computed_at AS intel_computed_at
FROM public.projects p
LEFT JOIN public.project_intel i ON i.project_id = p.id;

COMMENT ON TABLE public.project_price_history IS 'Daily/weekly snapshots of avg/median price per sqm for trend analysis (12M, 6M, 1M deltas)';
COMMENT ON TABLE public.project_catalysts IS 'Future events that may move project value: infrastructure, legal, economic, commercial';
COMMENT ON TABLE public.project_intel IS 'Cached scoring + AI narrative per project. Recomputed by compute-intel job.';
