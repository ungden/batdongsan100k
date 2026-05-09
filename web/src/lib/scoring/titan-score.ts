/**
 * TitanHome composite scoring engine.
 * Pure deterministic functions — no DB, no I/O.
 *
 * Three flavored scores share the same component pool but with different weights:
 *   • titan       — balanced overall
 *   • investment  — leans on ROI/CAGR/catalyst
 *   • rental      — leans on yield/liquidity
 *   • living      — leans on legal/developer/risk-inverted
 */

export type DeveloperTier = 'tier1' | 'tier2' | 'unknown'

export interface ScoreInputs {
  /** % gain since launch_price → current avg_price_per_sqm. Null when no launch_price. */
  roiFromLaunch: number | null
  /** % change last 12 months from price_history. */
  priceChange12m: number | null
  /** Gross rental yield (%/year). */
  grossYield: number | null
  /** 0..10 liquidity score. */
  liquidityScore: number | null
  /** Number of catalysts with impact='high'. */
  catalystCountHigh: number
  /** Raw legal_status string from projects table. */
  legalStatus: string | null
  /** 0..10 risk score (HIGHER means more risky). */
  riskScore: number | null
  /** Tier of the developer brand. */
  developerTier: DeveloperTier
}

export interface ScoreOutput {
  titan: number
  investment: number
  rental: number
  living: number
  breakdown: Record<string, number>
}

/** Top-tier Vietnamese developers with strong delivery track record. */
const TIER1_DEVELOPERS = new Set([
  'Vingroup', 'Vinhomes',
  'Masterise Homes', 'CapitaLand',
  'Keppel Land', 'Gamuda Land',
  'Phú Mỹ Hưng', 'SonKim Land',
  'Nam Long Group',
])

const TIER2_DEVELOPERS = new Set([
  'Novaland', 'Hưng Thịnh Corp',
  'Sunshine Group', 'TNR Holdings',
  'Kusto Home', 'An Gia',
])

/** Classify developer string into a tier. Free-text matching, case-insensitive contains. */
export function developerTier(developer: string | null | undefined): DeveloperTier {
  if (!developer) return 'unknown'
  const lower = developer.toLowerCase()
  for (const t1 of TIER1_DEVELOPERS) {
    if (lower.includes(t1.toLowerCase())) return 'tier1'
  }
  for (const t2 of TIER2_DEVELOPERS) {
    if (lower.includes(t2.toLowerCase())) return 'tier2'
  }
  return 'unknown'
}

const clamp10 = (n: number) => Math.max(0, Math.min(10, n))

// Component scorers — each returns 0..10
function roiComponent(roi: number | null): number {
  if (roi == null) return 5 // neutral when unknown
  // ROI 100% → 10 điểm. ROI 0% → 0. ROI âm → 0.
  return clamp10(roi / 10)
}

function trendComponent(change12m: number | null): number {
  if (change12m == null) return 5
  // +20%/year → 10 điểm. -10% → 0.
  return clamp10((change12m + 10) / 3)
}

function yieldComponent(grossYield: number | null): number {
  if (grossYield == null) return 4
  // 6%/năm → 10 điểm. 0% → 0.
  return clamp10((grossYield / 6) * 10)
}

function liquidityComponent(liq: number | null): number {
  if (liq == null) return 5
  return clamp10(liq)
}

function catalystComponent(catalystCountHigh: number): number {
  return clamp10(catalystCountHigh * 2.5)
}

function legalComponent(legalStatus: string | null): number {
  if (!legalStatus) return 3
  const lower = legalStatus.toLowerCase()
  if (lower.includes('sổ hồng') || lower.includes('so hong')) return 10
  if (lower.includes('sổ đỏ') || lower.includes('so do')) return 10
  if (lower.includes('hđmb') || lower.includes('hop dong')) return 6
  return 4
}

function riskInvertedComponent(risk: number | null): number {
  if (risk == null) return 6
  return clamp10(10 - risk)
}

function developerComponent(tier: DeveloperTier): number {
  if (tier === 'tier1') return 10
  if (tier === 'tier2') return 7
  return 5
}

/** Weighted sum helper. Weights MUST sum to 1.0 (asserted in tests). */
function weighted(parts: Record<string, number>, weights: Record<string, number>): number {
  let sum = 0
  for (const key of Object.keys(weights)) {
    sum += (parts[key] ?? 0) * weights[key]
  }
  return Number(sum.toFixed(2))
}

const TITAN_WEIGHTS = {
  roi: 0.20,
  yield: 0.20,
  liquidity: 0.15,
  catalyst: 0.15,
  legal: 0.10,
  risk: 0.10,
  developer: 0.10,
}

const INVESTMENT_WEIGHTS = {
  roi: 0.30,
  trend: 0.20,
  catalyst: 0.20,
  liquidity: 0.10,
  legal: 0.10,
  risk: 0.05,
  developer: 0.05,
}

const RENTAL_WEIGHTS = {
  yield: 0.40,
  liquidity: 0.20,
  legal: 0.10,
  developer: 0.10,
  risk: 0.10,
  catalyst: 0.05,
  trend: 0.05,
}

const LIVING_WEIGHTS = {
  legal: 0.20,
  developer: 0.20,
  risk: 0.20,
  catalyst: 0.15,
  liquidity: 0.10,
  yield: 0.10,
  trend: 0.05,
}

export function computeTitanScore(input: ScoreInputs): ScoreOutput {
  const parts = {
    roi: roiComponent(input.roiFromLaunch),
    trend: trendComponent(input.priceChange12m),
    yield: yieldComponent(input.grossYield),
    liquidity: liquidityComponent(input.liquidityScore),
    catalyst: catalystComponent(input.catalystCountHigh),
    legal: legalComponent(input.legalStatus),
    risk: riskInvertedComponent(input.riskScore),
    developer: developerComponent(input.developerTier),
  }

  return {
    titan: weighted(parts, TITAN_WEIGHTS),
    investment: weighted(parts, INVESTMENT_WEIGHTS),
    rental: weighted(parts, RENTAL_WEIGHTS),
    living: weighted(parts, LIVING_WEIGHTS),
    breakdown: parts,
  }
}

/** Verifies all weight maps sum to ~1.0. Used by tests. */
export const _WEIGHT_MAPS = {
  TITAN_WEIGHTS,
  INVESTMENT_WEIGHTS,
  RENTAL_WEIGHTS,
  LIVING_WEIGHTS,
}
