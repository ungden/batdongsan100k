/**
 * Good Deal Detector — classify a single listing's price/m² against
 * the project's average. Pure deterministic function.
 *
 * Used by:
 *   - properties query layer (when listing.project_id is known)
 *   - PropertyCard badge (via property.priceTag)
 */

export type DealClass = 'hot_deal' | 'below_market' | 'fair' | 'above_market' | 'overpriced' | 'need_check';

export interface DealInputs {
  /** Listing price total (đ). */
  listingPrice: number;
  /** Listing area (m²). */
  listingArea: number;
  /** Project average price/m² (đ/m²). */
  projectAvgPricePerSqm: number | null;
  /** Optional category — only "sale" is classified; "rent" returns 'fair'. */
  category?: 'sale' | 'rent' | string;
  /** Optional days on market — really stale listings need check. */
  daysOnMarket?: number;
}

/**
 * Returns one of the existing PropertyCard badge categories.
 * Map of behavior:
 *   ratio < 0.85 → hot_deal (15%+ below avg)
 *   0.85 ≤ ratio < 0.95 → below_market
 *   0.95 ≤ ratio < 1.05 → fair (no badge)
 *   1.05 ≤ ratio < 1.20 → above_market
 *   ratio ≥ 1.20 → overpriced (20%+ above)
 */
export function classifyDeal(input: DealInputs): DealClass {
  const { listingPrice, listingArea, projectAvgPricePerSqm, category, daysOnMarket } = input;

  // Rent listings use a different metric (yield-based), skip for now
  if (category === 'rent') return 'fair';

  if (!listingPrice || !listingArea || listingArea <= 0 || !projectAvgPricePerSqm || projectAvgPricePerSqm <= 0) {
    return 'need_check';
  }

  const listingPerSqm = listingPrice / listingArea;
  const ratio = listingPerSqm / projectAvgPricePerSqm;

  // Stale listing flag overrides minor anomalies
  if (daysOnMarket != null && daysOnMarket > 90 && ratio < 0.85) {
    return 'need_check';
  }

  if (ratio < 0.85) return 'hot_deal';
  if (ratio < 0.95) return 'below_market';
  if (ratio < 1.05) return 'fair';
  if (ratio < 1.20) return 'above_market';
  return 'overpriced';
}

/** Map the internal classification to the PropertyCard `priceTag` value. */
export function dealClassToPriceTag(c: DealClass): 'hot_deal' | 'below_market' | 'above_market' | 'overpriced' | null {
  switch (c) {
    case 'hot_deal': return 'hot_deal';
    case 'below_market': return 'below_market';
    case 'above_market': return 'above_market';
    case 'overpriced': return 'overpriced';
    default: return null; // 'fair' or 'need_check' get no badge
  }
}
