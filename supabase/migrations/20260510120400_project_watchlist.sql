-- Project watchlist with alert rules.
-- Users can subscribe to a project and define triggers that emit notifications
-- via the existing `notifications` table.

CREATE TABLE IF NOT EXISTS public.project_watchlist (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  -- Each rule: { type: 'price_below'|'yield_above'|'new_catalyst'|'titan_score_above', value?: number }
  rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_alerted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user ON public.project_watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_project ON public.project_watchlist (project_id);

ALTER TABLE public.project_watchlist ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own watch entries
DO $$ BEGIN
  CREATE POLICY "watchlist_owner_select" ON public.project_watchlist
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "watchlist_owner_modify" ON public.project_watchlist
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Service role can write notifications for watch alerts (already implicit)
COMMENT ON TABLE public.project_watchlist IS
  'User subscriptions to project intel changes. Rules array drives the alert worker.';
