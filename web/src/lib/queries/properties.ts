import { createClient } from '@/lib/supabase/server'
import type { Agent, Property } from '@/lib/types'

function formatListingPrice(price: number) {
  if (price >= 1_000_000_000) {
    return {
      priceFormatted: (price / 1_000_000_000).toFixed(1).replace(/\.0$/, ''),
      priceUnit: 'tỷ' as const,
    }
  }

  if (price >= 1_000_000) {
    return {
      priceFormatted: Math.round(price / 1_000_000).toString(),
      priceUnit: 'triệu' as const,
    }
  }

  return {
    priceFormatted: String(price || ''),
    priceUnit: 'tỷ' as const,
  }
}

function mapListingCategory(row: Record<string, unknown>): Property['category'] {
  if ((row.category as string) === 'rent') return 'rent'
  return 'sale'
}

function mapListingType(row: Record<string, unknown>): Property['type'] {
  const category = row.category as string
  switch (category) {
    case 'apartment':
      return 'chung-cu'
    case 'land':
      return 'dat-nen'
    case 'room':
      return 'phong-tro'
    case 'house':
    default:
      return 'nha-pho'
  }
}

function mapListingAgent(row: Record<string, unknown>): Agent {
  return {
    id: (row.user_id as string) || '',
    name: (row.contact_name as string) || 'TitanHome',
    phone: (row.contact_phone as string) || '',
    email: '',
    avatar: 'https://i.pravatar.cc/150?u=titanhome',
  }
}

function mapToProperty(row: Record<string, unknown>): Property {
  const price = Number(row.price || 0)
  const formatted = formatListingPrice(price)
  const images = Array.isArray(row.images) ? (row.images as string[]) : []

  return {
    id: row.id as string,
    title: (row.title as string) || '',
    slug: (row.id as string) || '',
    price,
    priceFormatted: formatted.priceFormatted,
    priceUnit: formatted.priceUnit,
    type: mapListingType(row),
    category: mapListingCategory(row),
    address: (row.address as string) || '',
    district: (row.district as string) || '',
    city: ((row.city as string) || (row.province as string) || '').replace(/^TP\s+/i, 'TP. '),
    bedrooms: 0,
    bathrooms: 0,
    area: Number(row.area || 0),
    floor: (row.floors as number) || undefined,
    direction: (row.orientation as string) || undefined,
    description: (row.description as string) || '',
    images,
    features: [],
    agent: mapListingAgent(row),
    status: ((row.status as string) === 'approved' ? 'published' : ((row.status as string) as Property['status'])) || 'published',
    authorId: (row.user_id as string) || '',
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || (row.created_at as string) || new Date().toISOString(),
    isFeatured: Boolean(row.is_vip) || Number(row.priority_level || 0) > 0,
    latitude: undefined,
    longitude: undefined,
    priorityLevel: Number(row.priority_level || 0),
    sortDate: (row.sort_date as string) || (row.created_at as string) || new Date().toISOString(),
  }
}

export async function getPublishedProperties(
  filters?: {
    q?: string
    type?: string
    city?: string
    district?: string
    category?: string
    direction?: string
    feature?: string
    bedroomsMin?: number
    bathroomsMin?: number
    areaMin?: number
    areaMax?: number
    priceMin?: number
    priceMax?: number
    sort?: 'latest' | 'price_asc' | 'price_desc' | 'area_desc'
  },
  limit?: number,
  offset?: number,
) {
  try {
    const supabase = await createClient()
    let query = supabase.from('listings').select('*', { count: 'estimated' }).in('status', ['active', 'approved', 'published'])

    if (filters?.q) query = query.or(`title.ilike.%${filters.q}%,address.ilike.%${filters.q}%,district.ilike.%${filters.q}%,city.ilike.%${filters.q}%`)
    if (filters?.type) {
      query = query.eq('type', filters.type)
    }
    if (filters?.city) query = query.or(`city.eq.${filters.city},province.eq.${filters.city}`)
    if (filters?.district) query = query.ilike('district', `%${filters.district}%`)
    if (filters?.category === 'rent') query = query.eq('category', 'rent')
    if (filters?.category === 'sale') query = query.eq('category', 'sale')
    if (filters?.areaMin) query = query.gte('area', filters.areaMin)
    if (filters?.areaMax) query = query.lte('area', filters.areaMax)
    if (filters?.priceMin) query = query.gte('price', filters.priceMin)
    if (filters?.priceMax) query = query.lte('price', filters.priceMax)

    switch (filters?.sort) {
      case 'price_asc':
        query = query.order('price', { ascending: true })
        break
      case 'price_desc':
        query = query.order('price', { ascending: false })
        break
      case 'area_desc':
        query = query.order('area', { ascending: false })
        break
      default:
        query = query.order('is_vip', { ascending: false }).order('priority_level', { ascending: false }).order('sort_date', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false })
        break
    }

    if (offset !== undefined) query = query.range(offset, offset + (limit || 12) - 1)
    else if (limit !== undefined) query = query.limit(limit)

    const { data, error, count } = await query
    if (error) throw error
    return { properties: (data || []).map(mapToProperty), count: count || 0 }
  } catch {
    const { properties: mockProperties } = await import('@/lib/data')
    let filtered = [...mockProperties]
    if (filters?.type) filtered = filtered.filter((p) => p.type === filters.type)
    if (filters?.city) filtered = filtered.filter((p) => p.city === filters.city)
    if (filters?.district) filtered = filtered.filter((p) => p.district.includes(filters.district!))
    if (filters?.category) filtered = filtered.filter((p) => p.category === filters.category)
    if (filters?.areaMin) filtered = filtered.filter((p) => p.area >= filters.areaMin!)
    if (filters?.areaMax) filtered = filtered.filter((p) => p.area <= filters.areaMax!)
    if (filters?.priceMin) filtered = filtered.filter((p) => p.price >= filters.priceMin!)
    if (filters?.priceMax) filtered = filtered.filter((p) => p.price <= filters.priceMax!)
    if (filters?.q) filtered = filtered.filter((p) => `${p.title} ${p.address} ${p.district} ${p.city}`.toLowerCase().includes(filters.q!.toLowerCase()))
    const total = filtered.length
    const start = offset || 0
    const end = limit ? start + limit : filtered.length
    return { properties: filtered.slice(start, end), count: total }
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', slug)
      .in('status', ['active', 'approved', 'published'])
      .single()

    if (error || !data) throw error
    return mapToProperty(data)
  } catch {
    const { getPropertyBySlug: getMock } = await import('@/lib/data')
    return getMock(slug)
  }
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const result = await getPublishedProperties(undefined, limit)
  return result.properties.filter((p) => p.isFeatured).slice(0, limit)
}

export async function getSimilarProperties(property: { type: string; city: string; id: string }, limit = 3): Promise<Property[]> {
  const result = await getPublishedProperties({ type: property.type, city: property.city }, limit + 3)
  return result.properties.filter((p) => p.id !== property.id).slice(0, limit)
}

export async function incrementViewCount(propertyId: string) {
  try {
    const supabase = await createClient()
    const { data: current } = await supabase.from('listings').select('views').eq('id', propertyId).single()
    if (current) {
      await supabase.from('listings').update({ views: (current.views || 0) + 1 }).eq('id', propertyId)
    }
  } catch {
    // no-op
  }
}

export async function getPropertiesCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase.from('listings').select('*', { count: 'exact', head: true }).in('status', ['active', 'approved', 'published'])
    return count || 0
  } catch {
    const { properties: mock } = await import('@/lib/data')
    return mock.length
  }
}

export async function getAgentsCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
    return count || 0
  } catch {
    return 0
  }
}

export async function getLatestProperties(limit = 8): Promise<Property[]> {
  const result = await getPublishedProperties(undefined, limit)
  return result.properties.slice(0, limit)
}

export async function getVipProperties(limit = 6): Promise<Property[]> {
  const result = await getPublishedProperties(undefined, limit * 2)
  return result.properties.filter((p) => p.isFeatured).slice(0, limit)
}

export async function getPriorityProperties(limit = 6): Promise<Property[]> {
  const result = await getPublishedProperties(undefined, limit * 2)
  return result.properties.filter((p) => (p.priorityLevel || 0) > 0).slice(0, limit)
}

export async function getRentProperties(limit = 6): Promise<Property[]> {
  const result = await getPublishedProperties({ category: 'rent' }, limit)
  return result.properties
}

export async function getMostViewedProperties(limit = 6): Promise<Property[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('listings').select('*').in('status', ['active', 'approved', 'published']).order('views', { ascending: false }).limit(limit)
    if (error) throw error
    return (data || []).map(mapToProperty)
  } catch {
    const { properties: mock } = await import('@/lib/data')
    return mock.slice(0, limit)
  }
}

export async function getPropertiesByType(type: string, limit = 6): Promise<Property[]> {
  const result = await getPublishedProperties({ type }, limit)
  return result.properties
}

export async function getProjectSummaries(limit = 12) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('projects')
      .select(`
        id, name, slug, city, district, cover_image,
        properties(id, price, price_unit)
      `)
      .limit(limit)

    if (error) throw error

    return data.map((proj: any) => {
      const validListings = proj.properties || []
      const propertyCount = validListings.length
      
      const sortedByPrice = [...validListings].sort((a, b) => a.price - b.price)
      const cheapest = sortedByPrice[0]

      const formatted = cheapest ? formatListingPrice(cheapest.price) : { priceFormatted: '0', priceUnit: 'tỷ' }

      return {
        id: proj.id,
        name: proj.name,
        slug: proj.slug,
        city: proj.city,
        district: proj.district,
        coverImage: proj.cover_image,
        propertyCount,
        minPriceFormatted: propertyCount > 0 ? `${formatted.priceFormatted} ${formatted.priceUnit}` : 'Liên hệ',
      }
    }).sort((a, b) => b.propertyCount - a.propertyCount)
  } catch (err) {
    console.error("Error fetching projects:", err)
    return []
  }
}

export async function getProjectListingsBySlug(slug: string, limit = 12): Promise<Property[]> {
  try {
    const supabase = await createClient()
    const { data: project } = await supabase.from('projects').select('id').eq('slug', slug).single()
    if (!project) return []

    const result = await getPublishedProperties({ q: '' }, limit)
    const { data } = await supabase.from('listings').select('*, agent:agents(*)').eq('project_id', project.id).in('status', ['active', 'approved', 'published']).limit(limit)
    return (data || []).map(mapToProperty)
  } catch {
    return []
  }
}
