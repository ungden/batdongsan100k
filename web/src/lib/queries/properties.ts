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
  if ((row.transaction_type as string) === 'cho-thue') return 'rent'
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
  const agent = row.agent as Record<string, unknown> || {}
  return {
    id: row.id as string,
    title: (row.title as string) || '',
    slug: (row.slug as string) || (row.id as string) || '',
    price: Number(row.price || 0),
    priceFormatted: (row.price_formatted as string) || '',
    priceUnit: (row.price_unit as any) || 'tỷ',
    type: (row.type as any) || 'nha-pho',
    category: (row.category as any) || 'sale',
    address: (row.address as string) || '',
    district: (row.district as string) || '',
    city: (row.city as string) || '',
    bedrooms: Number(row.bedrooms || 0),
    bathrooms: Number(row.bathrooms || 0),
    area: Number(row.area || 0),
    floor: (row.floor as number) || undefined,
    direction: (row.direction as string) || undefined,
    description: (row.description as string) || '',
    images: Array.isArray(row.images) ? (row.images as string[]) : [],
    features: Array.isArray(row.features) ? (row.features as string[]) : [],
    agent: {
      id: (row.agent_id as string) || (row.created_by as string) || '',
      name: (agent.name as string) || 'TitanHome',
      phone: (agent.phone as string) || '',
      email: '',
      avatar: (agent.avatar as string) || 'https://i.pravatar.cc/150?u=titanhome',
    },
    status: (row.status as any) || 'published',
    authorId: (row.created_by as string) || '',
    createdAt: (row.created_at as string) || new Date().toISOString(),
    updatedAt: (row.updated_at as string) || (row.created_at as string) || new Date().toISOString(),
    isFeatured: Boolean(row.is_featured) || Boolean(row.is_vip) || Boolean(row.is_priority),
    latitude: row.latitude as number | undefined,
    longitude: row.longitude as number | undefined,
    priorityLevel: Boolean(row.is_priority) ? 1 : 0,
    sortDate: (row.created_at as string) || new Date().toISOString(),
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
    let query = supabase.from('properties').select('*, agent:agents(*)', { count: 'estimated' }).in('status', ['published', 'active', 'approved'])

    if (filters?.q) query = query.or(`title.ilike.%${filters.q}%,address.ilike.%${filters.q}%,district.ilike.%${filters.q}%,city.ilike.%${filters.q}%`)
    if (filters?.type) query = query.eq('type', filters.type)
    if (filters?.city) query = query.eq('city', filters.city)
    if (filters?.district) query = query.ilike('district', `%${filters.district}%`)
    if (filters?.category) query = query.eq('category', filters.category)
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
        query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false })
        break
    }

    if (offset !== undefined) query = query.range(offset, offset + (limit || 12) - 1)
    else if (limit !== undefined) query = query.limit(limit)

    const { data, error, count } = await query
    if (error) throw error
    return { properties: (data || []).map(mapToProperty), count: count || 0 }
  } catch {
    return { properties: [], count: 0 }
  }
}

export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*, agent:agents(*)')
      .eq('slug', slug)
      .in('status', ['published', 'active', 'approved'])
      .single()

    if (error || !data) throw error
    return mapToProperty(data)
  } catch {
    return undefined
  }
}

export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  const result = await getPublishedProperties(undefined, limit * 2)
  return result.properties.filter((p) => p.isFeatured).slice(0, limit)
}

export async function getSimilarProperties(property: { type: string; city: string; id: string }, limit = 3): Promise<Property[]> {
  const result = await getPublishedProperties({ type: property.type, city: property.city }, limit + 3)
  return result.properties.filter((p) => p.id !== property.id).slice(0, limit)
}

export async function incrementViewCount(propertyId: string) {
  try {
    const supabase = await createClient()
    const { data: current } = await supabase.from('properties').select('views_count').eq('id', propertyId).single()
    if (current) {
      await supabase.from('properties').update({ views_count: (current.views_count || 0) + 1 }).eq('id', propertyId)
    }
  } catch {
    // no-op
  }
}

export async function getPropertiesCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase.from('properties').select('*', { count: 'exact', head: true }).in('status', ['published', 'active', 'approved'])
    return count || 0
  } catch {
    return 0
  }
}

export async function getAgentsCount(): Promise<number> {
  try {
    const supabase = await createClient()
    const { count } = await supabase.from('agents').select('*', { count: 'exact', head: true })
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
    const { data, error } = await supabase.from('properties').select('*, agent:agents(*)').in('status', ['published', 'active', 'approved']).order('views_count', { ascending: false }).limit(limit)
    if (error) throw error
    return (data || []).map(mapToProperty)
  } catch {
    return []
  }
}

export async function getPropertiesByType(type: string, limit = 6): Promise<Property[]> {
  const result = await getPublishedProperties({ type }, limit)
  return result.properties
}

const KNOWN_PROJECTS = [
  'Vinhomes Riverside', 'Vinhomes Ocean Park', 'Vinhomes Grand Park',
  'Landmark 81', 'Masteri Thảo Điền', 'Masteri Centre Point',
  'The Sun Avenue', 'Aqua City', 'Ecopark Grand', 'Lakeview City',
  'Tây Hồ Tây', 'Empire City', 'Sunwah Pearl', 'The Rivus',
  'Holm', 'Sadeco', 'Belleville', 'Verosa Park', 'The Marq',
]

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function detectProjectName(title: string, address: string, description: string): string | null {
  const haystack = `\${title} \${address} \${description}`.toLowerCase()
  const matched = KNOWN_PROJECTS.find((name) => haystack.includes(name.toLowerCase()))
  return matched || null
}

export async function getProjectSummaries(limit = 12) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select('id, title, address, district, city, description, price, price_unit, images')
      .in('status', ['active', 'approved', 'published'])
      .limit(3000)

    if (error) throw error

    const grouped = new Map<string, any>()

    for (const item of data || []) {
      const projectName = detectProjectName(item.title || '', item.address || '', item.description || '')
      if (!projectName) continue

      const slug = slugify(projectName)
      if (!grouped.has(slug)) {
        grouped.set(slug, {
          name: projectName,
          slug,
          city: item.city || 'Chưa cập nhật',
          district: item.district || 'Chưa cập nhật',
          coverImage: (item.images && item.images.length > 0) ? item.images[0] : '/placeholder.jpg',
          propertyCount: 0,
          minPrice: Number.MAX_SAFE_INTEGER,
          minPriceFormatted: '',
          minPriceUnit: '',
        })
      }

      const group = grouped.get(slug)
      group.propertyCount++

      const itemPrice = Number(item.price || 0)
      if (itemPrice > 0 && itemPrice < group.minPrice) {
        group.minPrice = itemPrice
        const formatted = formatListingPrice(itemPrice)
        group.minPriceFormatted = formatted.priceFormatted
        group.minPriceUnit = formatted.priceUnit
      }
    }

    return Array.from(grouped.values())
      .map(group => ({
        ...group,
        minPriceFormatted: group.minPrice < Number.MAX_SAFE_INTEGER 
          ? `\${group.minPriceFormatted} \${group.minPriceUnit}` 
          : 'Liên hệ',
      }))
      .sort((a, b) => b.propertyCount - a.propertyCount)
      .slice(0, limit)
  } catch (err) {
    console.error("Error fetching projects:", err)
    return []
  }
}

export async function getProjectListingsBySlug(slug: string, limit = 12): Promise<Property[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select('*, agent:agents(*)')
      .in('status', ['active', 'approved', 'published'])
      .limit(3000)

    if (error || !data) throw error

    const matchingItems = (data || []).filter((item: any) => {
      const projectName = detectProjectName(item.title || '', item.address || '', item.description || '')
      return projectName ? slugify(projectName) === slug : false
    })

    return matchingItems.slice(0, limit).map(mapToProperty)
  } catch {
    return []
  }
}
