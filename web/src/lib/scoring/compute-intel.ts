/**
 * Compute and persist project_intel rows for every project.
 *
 * Designed to run as a cron (every 6h) — invoked from a Next route handler
 * /api/jobs/recompute-intel or a Supabase Edge Function. Idempotent.
 *
 * Usage:
 *   import { recomputeAllIntel } from '@/lib/scoring/compute-intel'
 *   await recomputeAllIntel({ supabase })
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { computeTitanScore, developerTier } from './titan-score'

interface ProjectRow {
  id: string
  name: string
  slug: string
  developer: string | null
  legal_status: string | null
  launch_price: number | null
  current_price: number | null
  avg_price_per_sqm: number | null
  rental_yield: number | null
  property_count: number | null
  completion_date: string | null
}

interface PriceSnapshot {
  snapshot_date: string
  avg_price_per_sqm: number | null
}

interface CatalystRow {
  impact: 'high' | 'medium' | 'low'
}

interface PropertyCount {
  category: 'sale' | 'rent' | string
  count: number
}

const MS_PER_DAY = 86_400_000

// ============================================================
// Per-component computers
// ============================================================

function pctChange(from: number | null, to: number | null): number | null {
  if (!from || !to || from <= 0) return null
  return Number((((to - from) / from) * 100).toFixed(2))
}

function cagr(launchPrice: number | null, currentPrice: number | null, completionDate: string | null): number | null {
  if (!launchPrice || !currentPrice || launchPrice <= 0) return null
  // Estimate years held: prefer completion_date; fallback 5 years
  let years = 5
  if (completionDate) {
    const yMatch = completionDate.match(/(\d{4})/)
    if (yMatch) {
      const year = Number(yMatch[1])
      const now = new Date().getFullYear()
      years = Math.max(1, now - year)
    }
  }
  const ratio = currentPrice / launchPrice
  return Number(((Math.pow(ratio, 1 / years) - 1) * 100).toFixed(2))
}

function liquidityScore(activeSale: number, activeRent: number, propertyCount: number): number {
  const total = activeSale + activeRent
  if (total === 0) return 0
  // Heuristic: 30+ active = thanh khoản cao. <5 = kén.
  const raw = Math.log10(total + 1) * 5 // 1→1.5, 10→5.2, 30→7.4, 100→10
  // Bonus if active/totalUnits ratio is healthy (1-5%)
  const ratio = propertyCount > 0 ? total / propertyCount : 0
  const bonus = ratio > 0.01 && ratio < 0.05 ? 1 : 0
  return Math.max(0, Math.min(10, Number((raw + bonus).toFixed(2))))
}

function riskAssessment(
  cagrPct: number | null,
  activeSale: number,
  legalStatus: string | null,
  propertyCount: number,
): { score: number; tags: string[] } {
  const tags: string[] = []
  let score = 3 // base

  if (cagrPct != null && cagrPct > 20) {
    tags.push('price_overheated')
    score += 2
  }
  if (activeSale > 50) {
    tags.push('supply_glut')
    score += 1.5
  }
  if (!legalStatus || (!legalStatus.toLowerCase().includes('sổ') && !legalStatus.toLowerCase().includes('so'))) {
    tags.push('legal_pending')
    score += 1.5
  }
  if (propertyCount < 5) {
    tags.push('low_data')
    score += 1
  }
  if (cagrPct != null && cagrPct < 0) {
    tags.push('price_declining')
    score += 1
  }

  return { score: Math.max(0, Math.min(10, Number(score.toFixed(2)))), tags }
}

// ============================================================
// Main entry: recompute one project
// ============================================================

export async function computeIntelForProject(
  supabase: SupabaseClient,
  project: ProjectRow,
): Promise<void> {
  const now = new Date()

  // 1) Pull last 13 months of price history
  const cutoff = new Date(now.getTime() - 400 * MS_PER_DAY).toISOString().slice(0, 10)
  const { data: history } = await supabase
    .from('project_price_history')
    .select('snapshot_date, avg_price_per_sqm')
    .eq('project_id', project.id)
    .gte('snapshot_date', cutoff)
    .order('snapshot_date', { ascending: false })

  const snaps = (history || []) as PriceSnapshot[]
  const latestPrice = snaps[0]?.avg_price_per_sqm ?? project.avg_price_per_sqm ?? null

  const findNearest = (daysAgo: number) => {
    const target = now.getTime() - daysAgo * MS_PER_DAY
    let best: PriceSnapshot | null = null
    let bestDelta = Infinity
    for (const s of snaps) {
      const t = new Date(s.snapshot_date).getTime()
      const delta = Math.abs(t - target)
      if (delta < bestDelta) {
        bestDelta = delta
        best = s
      }
    }
    // Only accept if within 60 days of target
    return bestDelta < 60 * MS_PER_DAY ? best : null
  }

  const price1mAgo = findNearest(30)?.avg_price_per_sqm ?? null
  const price6mAgo = findNearest(180)?.avg_price_per_sqm ?? null
  const price12mAgo = findNearest(365)?.avg_price_per_sqm ?? null

  const price_change_1m = pctChange(price1mAgo, latestPrice)
  const price_change_6m = pctChange(price6mAgo, latestPrice)
  const price_change_12m = pctChange(price12mAgo, latestPrice)

  // 2) ROI from launch
  const roi_from_launch = pctChange(project.launch_price, project.current_price ?? project.avg_price_per_sqm)
  const cagr_since_launch = cagr(project.launch_price, project.current_price ?? project.avg_price_per_sqm, project.completion_date)

  // 3) Liquidity (count active listings by category)
  const { data: counts } = await supabase
    .from('properties')
    .select('category', { count: 'exact', head: false })
    .eq('project_id', project.id)
    .eq('status', 'published')

  let activeSale = 0
  let activeRent = 0
  for (const r of (counts || []) as PropertyCount[]) {
    if (r.category === 'rent') activeRent++
    else activeSale++
  }
  const liq = liquidityScore(activeSale, activeRent, project.property_count || 0)

  // 4) Catalysts (high-impact count)
  const { data: catalystsRaw } = await supabase
    .from('project_catalysts')
    .select('impact')
    .eq('project_id', project.id)

  const catalysts = (catalystsRaw || []) as CatalystRow[]
  const catalystCountHigh = catalysts.filter((c) => c.impact === 'high').length

  // 5) Risk
  const { score: risk_score, tags: risk_tags } = riskAssessment(
    cagr_since_launch,
    activeSale,
    project.legal_status,
    project.property_count || 0,
  )

  // 6) Composite score
  const tier = developerTier(project.developer)
  const score = computeTitanScore({
    roiFromLaunch: roi_from_launch,
    priceChange12m: price_change_12m,
    grossYield: project.rental_yield,
    liquidityScore: liq,
    catalystCountHigh,
    legalStatus: project.legal_status,
    riskScore: risk_score,
    developerTier: tier,
  })

  // 7) Upsert
  await supabase
    .from('project_intel')
    .upsert({
      project_id: project.id,
      price_change_1m,
      price_change_6m,
      price_change_12m,
      roi_from_launch,
      cagr_since_launch,
      gross_yield: project.rental_yield,
      net_yield: project.rental_yield ? Number((project.rental_yield * 0.75).toFixed(2)) : null, // ~25% deductions
      active_sale_listings: activeSale,
      active_rent_listings: activeRent,
      avg_days_on_market: null, // TODO: requires created_at timestamp comparison
      liquidity_score: liq,
      risk_score,
      risk_tags,
      titan_score: score.titan,
      living_score: score.living,
      investment_score: score.investment,
      rental_score: score.rental,
      score_breakdown: score.breakdown,
      computed_at: now.toISOString(),
    })
}

// ============================================================
// Recompute all projects (entry for cron)
// ============================================================

export async function recomputeAllIntel(opts: {
  supabase: SupabaseClient
  limit?: number
}): Promise<{ ok: number; failed: number }> {
  const { supabase, limit = 200 } = opts
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, name, slug, developer, legal_status, launch_price, current_price, avg_price_per_sqm, rental_yield, property_count, completion_date')
    .limit(limit)

  if (error) throw error

  let ok = 0
  let failed = 0
  for (const p of (projects || []) as ProjectRow[]) {
    try {
      await computeIntelForProject(supabase, p)
      ok++
    } catch (err) {
      console.error(`[compute-intel] Failed for ${p.slug}:`, err)
      failed++
    }
  }
  return { ok, failed }
}
