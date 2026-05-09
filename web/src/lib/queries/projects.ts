import { createClient } from '@/lib/supabase/server'
import type { Property } from '@/lib/types'

export interface ProjectIntel {
  roiFromLaunch: number | null
  cagrSinceLaunch: number | null
  priceChange1m: number | null
  priceChange6m: number | null
  priceChange12m: number | null
  grossYield: number | null
  netYield: number | null
  activeSaleListings: number
  activeRentListings: number
  liquidityScore: number | null
  riskScore: number | null
  riskTags: string[]
  strengths: string[]
  weaknesses: string[]
  risks: string[]
  titanScore: number | null
  livingScore: number | null
  investmentScore: number | null
  rentalScore: number | null
}

export interface ProjectSummary {
  id: string
  name: string
  slug: string
  developer: string | null
  city: string
  district: string
  description: string | null
  coverImage: string | null
  propertyCount: number
  minPrice: number
  maxPrice: number
  avgPrice: number
  avgPricePerSqm: number
  avgArea: number
  status: string
  amenities: string[]
  // Rich project info
  priceRange: string | null
  completionDate: string | null
  legalStatus: string | null
  handoverStandard: string | null
  totalUnits: number | null
  soldUnits: number | null
  floors: number | null
  blocks: number | null
  apartmentTypes: string[]
  totalAreaHa: number | null
  rentalYield: number | null
  badges: string[]
  // Market intelligence (joined from project_intel)
  intel: ProjectIntel | null
  // Top catalyst chips (preview of project_catalysts)
  topCatalysts: { title: string; impact: string; horizon: string }[]
}

export interface ProjectDetail extends ProjectSummary {
  gallery: string[]
  typeBreakdown: Record<string, number>
  categoryBreakdown: Record<string, number>
  priceRanges: { label: string; count: number }[]
  // Tách riêng stats bán vs thuê
  saleStats: { count: number; minPrice: number; maxPrice: number; avgPrice: number }
  rentStats: { count: number; minPrice: number; maxPrice: number; avgPrice: number }
}

export interface MarketKPIs {
  totalProjects: number
  avgPricePerSqm: number
  trendUp: number
  trendDown: number
  newListings7d: number
  totalProperties: number
  // New: top performers for hero cards
  topRoi: { name: string; slug: string; value: number } | null
  topYield: { name: string; slug: string; value: number } | null
  topCatalyst: { name: string; slug: string; count: number } | null
  topTitan: { name: string; slug: string; value: number } | null
  // Sparkline data (last 6 months avg per sqm market-wide)
  marketTrend: number[]
}

function mapIntel(row: any): ProjectIntel | null {
  if (row.titan_score == null && row.roi_from_launch == null && row.intel_gross_yield == null) return null
  const num = (v: any) => v == null ? null : Number(v)
  return {
    roiFromLaunch: num(row.roi_from_launch),
    cagrSinceLaunch: num(row.cagr_since_launch),
    priceChange1m: num(row.price_change_1m),
    priceChange6m: num(row.price_change_6m),
    priceChange12m: num(row.price_change_12m),
    grossYield: num(row.intel_gross_yield),
    netYield: num(row.net_yield),
    activeSaleListings: row.active_sale_listings || 0,
    activeRentListings: row.active_rent_listings || 0,
    liquidityScore: num(row.liquidity_score),
    riskScore: num(row.risk_score),
    riskTags: row.risk_tags || [],
    strengths: row.strengths || [],
    weaknesses: row.weaknesses || [],
    risks: row.risks || [],
    titanScore: num(row.titan_score),
    livingScore: num(row.living_score),
    investmentScore: num(row.investment_score),
    rentalScore: num(row.rental_score),
  }
}

function mapProject(row: any, catalysts?: { title: string; impact: string; horizon: string }[]): ProjectSummary {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    developer: row.developer,
    city: row.city || 'Chưa cập nhật',
    district: row.district || 'Chưa cập nhật',
    description: row.description,
    coverImage: row.cover_image,
    propertyCount: row.property_count || 0,
    minPrice: Number(row.min_price || 0),
    maxPrice: Number(row.max_price || 0),
    avgPrice: Number(row.avg_price || 0),
    avgPricePerSqm: Number(row.avg_price_per_sqm || 0),
    avgArea: Number(row.avg_area || 0),
    status: row.status || 'selling',
    amenities: row.amenities || [],
    priceRange: row.price_range || null,
    completionDate: row.completion_date || null,
    legalStatus: row.legal_status || null,
    handoverStandard: row.handover_standard || null,
    totalUnits: row.total_units || null,
    soldUnits: row.sold_units || null,
    floors: row.floors || null,
    blocks: row.blocks || null,
    apartmentTypes: row.apartment_types || [],
    totalAreaHa: row.total_area_ha ? Number(row.total_area_ha) : null,
    rentalYield: row.rental_yield ? Number(row.rental_yield) : null,
    badges: row.badges || [],
    intel: mapIntel(row),
    topCatalysts: catalysts || [],
  }
}

// ============================================================
// Get all projects with optional filters
// ============================================================
export type ProjectSortField =
  | 'name'
  | 'property_count'
  | 'avg_price_per_sqm'
  | 'avg_price'
  | 'titan_score'
  | 'roi_from_launch'
  | 'gross_yield'
  | 'liquidity_score'
  | 'price_change_12m'

export type PurposeFilter = 'living' | 'rental' | 'investment' | 'flip'

export async function getProjects(filters?: {
  search?: string
  status?: string
  city?: string
  legal?: string                  // 'so_hong' | 'hdmb'
  minYield?: number
  minRoi?: number
  minLiquidity?: number
  maxPrice?: number               // tỷ
  purpose?: PurposeFilter
  sort?: ProjectSortField
  sortDir?: 'asc' | 'desc'
}, limit = 60): Promise<ProjectSummary[]> {
  try {
    const supabase = await createClient()
    // Use view that left-joins project_intel
    let query = supabase
      .from('v_projects_with_intel')
      .select('*')

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,city.ilike.%${filters.search}%,district.ilike.%${filters.search}%`)
    }
    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    if (filters?.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters?.legal === 'so_hong') {
      query = query.ilike('legal_status', '%sổ hồng%')
    } else if (filters?.legal === 'hdmb') {
      query = query.ilike('legal_status', '%hđmb%')
    }
    if (filters?.minYield != null) {
      query = query.gte('intel_gross_yield', filters.minYield)
    }
    if (filters?.minRoi != null) {
      query = query.gte('roi_from_launch', filters.minRoi)
    }
    if (filters?.minLiquidity != null) {
      query = query.gte('liquidity_score', filters.minLiquidity)
    }
    if (filters?.maxPrice != null) {
      query = query.lte('min_price', filters.maxPrice * 1_000_000_000)
    }

    // Purpose-driven re-rank: pick the score column matching intent.
    // Maps "Tôi muốn mua để..." → which composite drives ranking.
    const purposeSort: Record<PurposeFilter, string> = {
      living: 'titan_score',
      rental: 'intel_gross_yield',
      investment: 'roi_from_launch',
      flip: 'liquidity_score',
    }

    const sortField: ProjectSortField =
      filters?.purpose ? (purposeSort[filters.purpose] || 'titan_score')
      : (filters?.sort || 'titan_score')
    const sortAsc = filters?.sortDir === 'asc'
    query = query.order(sortField, { ascending: sortAsc, nullsFirst: false }).limit(limit)

    const { data, error } = await query
    if (error) throw error

    const projects = (data || [])
    if (projects.length === 0) return []

    // Fetch top catalysts for these projects in one batch
    const ids = projects.map((p: any) => p.id)
    const { data: catRows } = await supabase
      .from('project_catalysts')
      .select('project_id, title, impact, horizon, expected_date')
      .in('project_id', ids)
      .order('impact', { ascending: false })
      .order('expected_date', { ascending: true })

    const catalystMap = new Map<string, { title: string; impact: string; horizon: string }[]>()
    for (const c of (catRows || []) as any[]) {
      const arr = catalystMap.get(c.project_id) || []
      if (arr.length < 2) {
        arr.push({ title: c.title, impact: c.impact, horizon: c.horizon })
      }
      catalystMap.set(c.project_id, arr)
    }

    return projects.map((row: any) => mapProject(row, catalystMap.get(row.id) || []))
  } catch (err) {
    console.error('Error fetching projects:', err)
    return []
  }
}

// ============================================================
// Get single project by slug with enriched data
// ============================================================
export async function getProjectBySlug(slug: string): Promise<ProjectDetail | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('v_projects_with_intel')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error || !data) return null

    // Get gallery images + type/category breakdown from linked properties
    const { data: props } = await supabase
      .from('properties')
      .select('images, type, category, price')
      .eq('project_id', data.id)
      .eq('status', 'published')
      .limit(200)

    const gallery: string[] = []
    const typeBreakdown: Record<string, number> = {}
    const categoryBreakdown: Record<string, number> = {}
    const priceBuckets = [
      { label: '< 2 tỷ', min: 0, max: 2_000_000_000, count: 0 },
      { label: '2-5 tỷ', min: 2_000_000_000, max: 5_000_000_000, count: 0 },
      { label: '5-10 tỷ', min: 5_000_000_000, max: 10_000_000_000, count: 0 },
      { label: '10-20 tỷ', min: 10_000_000_000, max: 20_000_000_000, count: 0 },
      { label: '> 20 tỷ', min: 20_000_000_000, max: Infinity, count: 0 },
    ]

    // Stats tách riêng bán vs thuê
    const saleStats = { count: 0, minPrice: Infinity, maxPrice: 0, avgPrice: 0, total: 0 }
    const rentStats = { count: 0, minPrice: Infinity, maxPrice: 0, avgPrice: 0, total: 0 }

    for (const p of props || []) {
      // Gallery: collect unique images
      if (Array.isArray(p.images)) {
        for (const img of p.images) {
          if (gallery.length < 10 && img && !gallery.includes(img)) gallery.push(img)
        }
      }
      // Type breakdown
      const t = p.type || 'nha-pho'
      typeBreakdown[t] = (typeBreakdown[t] || 0) + 1
      // Category breakdown
      const c = p.category || 'sale'
      categoryBreakdown[c] = (categoryBreakdown[c] || 0) + 1
      // Price ranges (chỉ tính cho mua bán)
      const price = Number(p.price || 0)
      if (price > 0 && c === 'sale') {
        for (const bucket of priceBuckets) {
          if (price >= bucket.min && price < bucket.max) { bucket.count++; break }
        }
      }
      // Sale/Rent stats
      if (price > 0) {
        const stats = c === 'rent' ? rentStats : saleStats
        stats.count++
        stats.total += price
        if (price < stats.minPrice) stats.minPrice = price
        if (price > stats.maxPrice) stats.maxPrice = price
      }
    }

    saleStats.avgPrice = saleStats.count > 0 ? saleStats.total / saleStats.count : 0
    if (saleStats.minPrice === Infinity) saleStats.minPrice = 0
    rentStats.avgPrice = rentStats.count > 0 ? rentStats.total / rentStats.count : 0
    if (rentStats.minPrice === Infinity) rentStats.minPrice = 0

    return {
      ...mapProject(data),
      gallery,
      typeBreakdown,
      categoryBreakdown,
      priceRanges: priceBuckets.filter(b => b.count > 0).map(b => ({ label: b.label, count: b.count })),
      saleStats: { count: saleStats.count, minPrice: saleStats.minPrice, maxPrice: saleStats.maxPrice, avgPrice: saleStats.avgPrice },
      rentStats: { count: rentStats.count, minPrice: rentStats.minPrice, maxPrice: rentStats.maxPrice, avgPrice: rentStats.avgPrice },
    }
  } catch (err) {
    console.error('Error fetching project detail:', err)
    return null
  }
}

// ============================================================
// Get properties in a project
// ============================================================
export async function getProjectProperties(projectId: string, limit = 24): Promise<Property[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, slug, price, price_formatted, price_unit, type, category, address, district, city, bedrooms, bathrooms, area, images, is_featured, is_vip, is_priority, created_at, agent:agents(id, name, phone, avatar)')
      .eq('project_id', projectId)
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return (data || []).map((row: any) => {
      const agent = row.agent || {}
      return {
        id: row.id,
        title: row.title || '',
        slug: row.slug || row.id,
        price: Number(row.price || 0),
        priceFormatted: row.price_formatted || '',
        priceUnit: row.price_unit || 'tỷ',
        type: row.type || 'nha-pho',
        category: row.category || 'sale',
        address: row.address || '',
        district: row.district || '',
        city: row.city || '',
        bedrooms: row.bedrooms || 0,
        bathrooms: row.bathrooms || 0,
        area: Number(row.area || 0),
        description: '',
        images: Array.isArray(row.images) ? row.images : [],
        features: [],
        agent: {
          id: agent.id || '',
          name: agent.name || 'TitanHome',
          phone: agent.phone || '',
          email: '',
          avatar: agent.avatar || '',
        },
        status: 'published',
        authorId: '',
        createdAt: row.created_at || new Date().toISOString(),
        updatedAt: row.created_at || new Date().toISOString(),
        isFeatured: row.is_featured || row.is_vip || false,
      } as Property
    })
  } catch {
    return []
  }
}

// ============================================================
// Deep intel for AI panel (project + intel + catalysts + price history)
// ============================================================

export interface ProjectCatalyst {
  id: number
  title: string
  category: string
  impact: string
  status: string
  horizon: string
  expectedDate: string | null
  description: string | null
  sourceUrl: string | null
}

export interface PricePoint {
  date: string
  pricePerSqm: number
}

export interface ProjectDeepIntel {
  project: ProjectSummary
  catalysts: ProjectCatalyst[]
  priceHistory: PricePoint[]
  nearby: { name: string; slug: string; titanScore: number | null; avgPricePerSqm: number }[]
}

export async function getProjectDeepIntel(slug: string): Promise<ProjectDeepIntel | null> {
  try {
    const supabase = await createClient()
    const { data: row, error } = await supabase
      .from('v_projects_with_intel')
      .select('*')
      .eq('slug', slug)
      .single()
    if (error || !row) return null

    const [catRes, histRes, nearbyRes] = await Promise.all([
      supabase.from('project_catalysts')
        .select('*')
        .eq('project_id', row.id)
        .order('expected_date', { ascending: true }),
      supabase.from('project_price_history')
        .select('snapshot_date, avg_price_per_sqm')
        .eq('project_id', row.id)
        .order('snapshot_date', { ascending: true }),
      supabase.from('v_projects_with_intel')
        .select('name, slug, titan_score, avg_price_per_sqm')
        .eq('city', row.city)
        .neq('slug', slug)
        .order('titan_score', { ascending: false, nullsFirst: false })
        .limit(3),
    ])

    const project = mapProject(row)
    const catalysts: ProjectCatalyst[] = ((catRes.data || []) as any[]).map((c) => ({
      id: c.id,
      title: c.title,
      category: c.category,
      impact: c.impact,
      status: c.status,
      horizon: c.horizon,
      expectedDate: c.expected_date,
      description: c.description,
      sourceUrl: c.source_url,
    }))
    const priceHistory: PricePoint[] = ((histRes.data || []) as any[]).map((h) => ({
      date: String(h.snapshot_date),
      pricePerSqm: Number(h.avg_price_per_sqm || 0),
    }))
    const nearby = ((nearbyRes.data || []) as any[]).map((n) => ({
      name: n.name,
      slug: n.slug,
      titanScore: n.titan_score == null ? null : Number(n.titan_score),
      avgPricePerSqm: Number(n.avg_price_per_sqm || 0),
    }))

    return { project, catalysts, priceHistory, nearby }
  } catch (err) {
    console.error('getProjectDeepIntel failed:', err)
    return null
  }
}

// ============================================================
// Market KPIs
// ============================================================
export async function getMarketKPIs(): Promise<MarketKPIs> {
  const empty: MarketKPIs = {
    totalProjects: 0, avgPricePerSqm: 0, trendUp: 0, trendDown: 0, newListings7d: 0, totalProperties: 0,
    topRoi: null, topYield: null, topCatalyst: null, topTitan: null, marketTrend: [],
  }
  try {
    const supabase = await createClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [intelResult, newListingsResult, trendResult, catalystResult] = await Promise.all([
      supabase.from('v_projects_with_intel').select(
        'name, slug, avg_price_per_sqm, property_count, price_change_12m, roi_from_launch, intel_gross_yield, titan_score'
      ),
      supabase.from('properties').select('*', { count: 'exact', head: true })
        .eq('status', 'published').gte('created_at', sevenDaysAgo),
      // Market-wide monthly average (last 6 months)
      supabase.from('project_price_history')
        .select('snapshot_date, avg_price_per_sqm')
        .gte('snapshot_date', new Date(Date.now() - 200 * 86400_000).toISOString().slice(0, 10))
        .order('snapshot_date', { ascending: true }),
      // Top catalyst by high-impact count
      supabase.from('project_catalysts')
        .select('project_id, projects:projects(name, slug)')
        .eq('impact', 'high'),
    ])

    const rows = intelResult.data || []
    const totalProjects = rows.length
    const totalProperties = rows.reduce((s, r: any) => s + (r.property_count || 0), 0)
    const validPrices = rows.filter((r: any) => r.avg_price_per_sqm > 0)
    const avgPricePerSqm = validPrices.length
      ? validPrices.reduce((s, r: any) => s + Number(r.avg_price_per_sqm), 0) / validPrices.length
      : 0

    let trendUp = 0, trendDown = 0
    for (const r of rows as any[]) {
      const ch = Number(r.price_change_12m)
      if (Number.isFinite(ch)) {
        if (ch > 0) trendUp++
        else if (ch < 0) trendDown++
      }
    }

    const pickTop = (key: string) => {
      const filtered = rows.filter((r: any) => Number.isFinite(Number(r[key])))
      if (!filtered.length) return null
      const top = filtered.reduce((best: any, r: any) => Number(r[key]) > Number(best[key]) ? r : best)
      return { name: top.name, slug: top.slug, value: Number(Number(top[key]).toFixed(2)) }
    }
    const topRoi = pickTop('roi_from_launch')
    const topYield = pickTop('intel_gross_yield')
    const topTitan = pickTop('titan_score')

    // Top catalyst: project with most high-impact catalysts
    const catCounts = new Map<string, { name: string; slug: string; count: number }>()
    for (const c of (catalystResult.data || []) as any[]) {
      const proj = Array.isArray(c.projects) ? c.projects[0] : c.projects
      if (!proj) continue
      const cur = catCounts.get(c.project_id) || { name: proj.name, slug: proj.slug, count: 0 }
      cur.count++
      catCounts.set(c.project_id, cur)
    }
    let topCatalyst: { name: string; slug: string; count: number } | null = null
    for (const v of catCounts.values()) {
      if (!topCatalyst || v.count > topCatalyst.count) topCatalyst = v
    }

    // Build sparkline: avg of all projects per month, last 6 buckets
    const buckets = new Map<string, { sum: number; n: number }>()
    for (const r of (trendResult.data || []) as any[]) {
      const key = String(r.snapshot_date).slice(0, 7) // YYYY-MM
      const cur = buckets.get(key) || { sum: 0, n: 0 }
      cur.sum += Number(r.avg_price_per_sqm || 0)
      cur.n++
      buckets.set(key, cur)
    }
    const marketTrend = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([, { sum, n }]) => Math.round(sum / Math.max(1, n)))

    return {
      totalProjects,
      avgPricePerSqm: Math.round(avgPricePerSqm),
      trendUp,
      trendDown,
      newListings7d: newListingsResult.count || 0,
      totalProperties,
      topRoi,
      topYield,
      topCatalyst,
      topTitan,
      marketTrend,
    }
  } catch (err) {
    console.error('getMarketKPIs failed:', err)
    return empty
  }
}
