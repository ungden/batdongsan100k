import { createClient } from '@/lib/supabase/server'
import type { Property } from '@/lib/types'

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
}

function mapProject(row: any): ProjectSummary {
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
  }
}

// ============================================================
// Get all projects with optional filters
// ============================================================
export async function getProjects(filters?: {
  search?: string
  status?: string
  city?: string
  sort?: 'name' | 'property_count' | 'avg_price_per_sqm' | 'avg_price'
  sortDir?: 'asc' | 'desc'
}, limit = 60): Promise<ProjectSummary[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('projects')
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

    const sortField = filters?.sort || 'property_count'
    const sortDir = filters?.sortDir === 'asc'
    query = query.order(sortField, { ascending: sortDir }).limit(limit)

    const { data, error } = await query
    if (error) throw error
    return (data || []).map(mapProject)
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
      .from('projects')
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
// Market KPIs
// ============================================================
export async function getMarketKPIs(): Promise<MarketKPIs> {
  try {
    const supabase = await createClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const [projectsResult, newListingsResult] = await Promise.all([
      supabase.from('projects').select('avg_price_per_sqm, property_count'),
      supabase.from('properties').select('*', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('created_at', sevenDaysAgo),
    ])

    const projects = projectsResult.data || []
    const totalProjects = projects.length
    const totalProperties = projects.reduce((sum, p) => sum + (p.property_count || 0), 0)
    const validPrices = projects.filter(p => p.avg_price_per_sqm > 0)
    const avgPricePerSqm = validPrices.length > 0
      ? validPrices.reduce((sum, p) => sum + Number(p.avg_price_per_sqm), 0) / validPrices.length
      : 0

    return {
      totalProjects,
      avgPricePerSqm: Math.round(avgPricePerSqm),
      trendUp: Math.round(totalProjects * 0.6), // Placeholder - needs price history data
      trendDown: Math.round(totalProjects * 0.2),
      newListings7d: newListingsResult.count || 0,
      totalProperties,
    }
  } catch {
    return { totalProjects: 0, avgPricePerSqm: 0, trendUp: 0, trendDown: 0, newListings7d: 0, totalProperties: 0 }
  }
}
