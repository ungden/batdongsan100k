import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { recomputeAllIntel } from '@/lib/scoring/compute-intel'
import { generateNarrative, saveNarrative } from '@/lib/ai/project-narrative'

// POST /api/jobs/recompute-intel
// Header: Authorization: Bearer <CRON_SECRET>
// Recomputes project_intel for every project. Idempotent.

export const runtime = 'nodejs'
export const maxDuration = 300

function checkAuth(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET
  if (!expected) return false
  const auth = req.headers.get('authorization') ?? ''
  return auth === `Bearer ${expected}`
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  const supabase = getAdminClient()

  // Step 1: scoring
  const scoreResult = await recomputeAllIntel({ supabase })

  // Step 2: narrative (deterministic templates per project)
  const { data: projects } = await supabase
    .from('v_projects_with_intel')
    .select('id, name, developer, city, district, legal_status, total_units, rental_yield, roi_from_launch, cagr_since_launch, price_change_12m, liquidity_score, risk_tags, active_sale_listings, active_rent_listings')

  let narrativeOk = 0
  for (const p of projects || []) {
    try {
      // Count high-impact catalysts
      const { data: catalysts } = await supabase
        .from('project_catalysts')
        .select('impact')
        .eq('project_id', p.id)
        .eq('impact', 'high')

      const narrative = generateNarrative({
        projectId: p.id,
        name: p.name,
        developer: p.developer,
        city: p.city,
        district: p.district,
        legalStatus: p.legal_status,
        totalUnits: p.total_units,
        rentalYield: p.rental_yield,
        roiFromLaunch: p.roi_from_launch,
        cagrSinceLaunch: p.cagr_since_launch,
        priceChange12m: p.price_change_12m,
        liquidityScore: p.liquidity_score,
        riskTags: p.risk_tags || [],
        catalystCountHigh: (catalysts || []).length,
        activeSale: p.active_sale_listings || 0,
        activeRent: p.active_rent_listings || 0,
      })
      await saveNarrative(supabase, p.id, narrative)
      narrativeOk++
    } catch {
      // Continue on failure for one project
    }
  }

  return NextResponse.json({
    ok: true,
    scoring: scoreResult,
    narratives: narrativeOk,
  })
}

// GET → status check (no recompute)
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const supabase = getAdminClient()
  const { count: total } = await supabase
    .from('project_intel')
    .select('*', { count: 'exact', head: true })
  return NextResponse.json({ ok: true, intel_rows: total })
}
