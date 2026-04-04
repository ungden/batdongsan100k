import { createClient } from '@/lib/supabase/server'
import type { Agent, Property } from '@/lib/types'

// Columns needed for property cards (avoid select *)
const PROPERTY_CARD_COLUMNS = 'id, title, slug, price, price_formatted, price_unit, type, category, address, district, city, bedrooms, bathrooms, area, images, is_featured, is_vip, is_priority, views_count, created_at, agent:agents(id, name, phone, avatar)'

// Full columns for detail page
const PROPERTY_DETAIL_COLUMNS = '*, agent:agents(id, name, phone, avatar)'

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

// ============================================================
// Core query - used by listings page with full filter support
// ============================================================
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
    let query = supabase.from('properties').select(PROPERTY_CARD_COLUMNS, { count: 'estimated' }).eq('status', 'published')

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

// ============================================================
// Homepage: 1 query lấy featured + recent, phân loại JS-side
// Giảm từ ~10 queries xuống 1
// ============================================================
export async function getHomepageProperties() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_CARD_COLUMNS)
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(60)

    if (error) throw error
    const all = (data || []).map(mapToProperty)

    // Phân loại từ 1 dataset
    const vip = all.filter(p => p.isFeatured).slice(0, 6)
    const saleLatest = all.filter(p => p.category === 'sale').slice(0, 8)
    const rentLatest = all.filter(p => p.category === 'rent').slice(0, 8)
    const rentHot = all.filter(p => p.category === 'rent' && p.isFeatured).slice(0, 4)

    // Theo loại hình - sale
    const chungCu = all.filter(p => p.type === 'chung-cu' && p.category === 'sale').slice(0, 4)
    const nhaPho = all.filter(p => p.type === 'nha-pho' && p.category === 'sale').slice(0, 4)
    const datNen = all.filter(p => p.type === 'dat-nen' && p.category === 'sale').slice(0, 4)

    // Theo loại hình - rent
    const rentPhongTro = all.filter(p => p.type === 'phong-tro' && p.category === 'rent').slice(0, 4)
    const rentChungCu = all.filter(p => p.type === 'chung-cu' && p.category === 'rent').slice(0, 4)
    const rentVanPhong = all.filter(p => p.type === 'van-phong' && p.category === 'rent').slice(0, 4)

    return {
      vip, saleLatest, rentLatest, rentHot,
      chungCu, nhaPho, datNen,
      rentPhongTro, rentChungCu, rentVanPhong,
    }
  } catch {
    return {
      vip: [], saleLatest: [], rentLatest: [], rentHot: [],
      chungCu: [], nhaPho: [], datNen: [],
      rentPhongTro: [], rentChungCu: [], rentVanPhong: [],
    }
  }
}

// ============================================================
// Counts - gộp 2 count queries thành 1 function
// ============================================================
export async function getCounts() {
  try {
    const supabase = await createClient()
    const [propResult, agentResult] = await Promise.all([
      supabase.from('properties').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('agents').select('*', { count: 'exact', head: true }),
    ])
    return {
      propertiesCount: propResult.count || 0,
      agentsCount: agentResult.count || 0,
    }
  } catch {
    return { propertiesCount: 0, agentsCount: 0 }
  }
}

// ============================================================
// Detail page
// ============================================================
export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_DETAIL_COLUMNS)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !data) throw error
    return mapToProperty(data)
  } catch {
    return undefined
  }
}

// ============================================================
// Featured - query DB directly with is_featured filter
// ============================================================
export async function getFeaturedProperties(limit = 6): Promise<Property[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_CARD_COLUMNS)
      .eq('status', 'published')
      .or('is_featured.eq.true,is_vip.eq.true,is_priority.eq.true')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(mapToProperty)
  } catch {
    return []
  }
}

export async function getSimilarProperties(property: { type: string; city: string; id: string }, limit = 3): Promise<Property[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_CARD_COLUMNS)
      .eq('status', 'published')
      .eq('type', property.type)
      .eq('city', property.city)
      .neq('id', property.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return (data || []).map(mapToProperty)
  } catch {
    return []
  }
}

export async function incrementViewCount(propertyId: string) {
  try {
    const supabase = await createClient()
    await supabase.rpc('increment_view_count', { property_id: propertyId }).single()
  } catch {
    // Fallback to manual increment
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
}

export async function getMostViewedProperties(limit = 6): Promise<Property[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_CARD_COLUMNS)
      .eq('status', 'published')
      .order('views_count', { ascending: false })
      .limit(limit)
    if (error) throw error
    return (data || []).map(mapToProperty)
  } catch {
    return []
  }
}

// ============================================================
// Projects
// ============================================================
const KNOWN_PROJECTS = [
  // === HỒ CHÍ MINH ===
  // Vinhomes
  'Vinhomes Grand Park', 'Vinhomes Central Park', 'Vinhomes Golden River',
  'Vinhomes Tân Cảng', 'Vinhomes Ba Son',
  // Masteri
  'Masteri Thảo Điền', 'Masteri Centre Point', 'Masteri An Phú',
  'Masteri Millennium', 'Masteri Lumière',
  // Sunrise
  'Sunrise City', 'Sunrise Riverside', 'Sunrise CityView',
  // Phú Mỹ Hưng
  'Phú Mỹ Hưng', 'Midtown', 'Scenic Valley', 'Happy Valley', 'Happy Residence',
  'Green Valley', 'Hưng Phúc', 'The Panorama', 'Riverside Residence',
  'Garden Plaza', 'Sky Garden', 'River Park',
  // Quận 2/Thủ Đức
  'Diamond Island', 'Feliz En Vista', 'The Ascent', 'The Estella',
  'Estella Heights', 'Lexington Residence', 'The Sun Avenue', 'Cantavil',
  'Sala', 'One Verandah', 'Palm Heights', 'Palm City', 'Gem Riverside',
  'Lakeview City', 'Lucasta', 'The Nassim', 'Gateway Thảo Điền',
  'D\'Edge Thảo Điền', 'Vista Verde', 'The Vista',
  // Quận 7
  'Saigon South', 'Dragon Hill', 'Riviera Point', 'The View',
  'Q7 Saigon Riverside', 'Eco Green', 'Jamona', 'Era Town',
  'The Park Residence', 'Luxcity', 'Hoàng Anh Thanh Bình',
  // Quận 1/3/4/5
  'Saigon Pearl', 'Saigon Royal', 'Landmark 81', 'The Marq',
  'Sunwah Pearl', 'River Gate', 'The EverRich', 'Kingston Residence',
  'The Tresor', 'Millennium', 'Grand Riverside', 'De Capella',
  'Ha Do Centrosa', 'Xi Riverview', 'Xi Grand Court',
  'The Prince Residence', 'Hùng Vương Plaza',
  // Bình Thạnh/Gò Vấp/Tân Bình/Tân Phú
  'Botanica', 'The Gold View', 'Centana', 'Richstar',
  'Celadon City', 'Moonlight', 'Dream Home', 'Green Town',
  'Tara Residence', 'Orchard Garden', 'Orchard Parkview',
  'Cộng Hòa Garden', 'Galaxy', 'City Gate',
  'Prosper', 'Saigon Gateway', 'The Western Capital',
  'Phú Hoàng Anh', 'The Art',
  // Bình Dương
  'The Habitat', 'Lavita', 'Tecco',
  // Đồng Nai
  'Aqua City', 'Verosa Park', 'The Rivus', 'DIC Phoenix',
  // Phía Nam khác
  'Topaz Home', 'Topaz Elite', 'Topaz City',
  'Mizuki Park', 'Akari City', 'Safira', 'Hausneo', 'La Astoria',
  'Empire City', 'Sola Park', 'Lumiere Riverside',
  'An Gia Riverside', 'Saigon Intela',

  // === HÀ NỘI ===
  'Vinhomes Smart City', 'Vinhomes Ocean Park', 'Vinhomes Riverside',
  'Vinhomes Metropolis', 'Vinhomes West Point', 'Vinhomes Skylake',
  'Royal City', 'Times City', 'Goldmark City',
  'Imperia Sky Garden', 'Sunshine City', 'Sunshine Riverside',
  'The Zen', 'Tây Hồ Tây', 'Ngoại Giao Đoàn',
  'Mỹ Đình', 'Trung Hòa Nhân Chính',
  'Ecopark Grand', 'The Manor Hà Nội',
  'Ciputra', 'Starlake', 'Vạn Phúc City',

  // === ĐÀ NẴNG ===
  'Monarchy', 'Blooming Tower', 'Azura', 'Fhome',
  'The Sang Residence', 'Hiyori', 'Sun Cosmo',
  'Premier Sky Residences', 'Indochina Riverside',

  // === NHA TRANG / KHÁNH HÒA ===
  'The Costa Nha Trang', 'Mường Thanh', 'Vinpearl',
  'Gold Coast', 'Scenia Bay', 'Ocean Gate',
  'Nha Trang Center', 'CT2 VCN Phước Hải',

  // === BÌNH THUẬN / VŨNG TÀU ===
  'Ocean Vista', 'Melody Vũng Tàu', 'NovaWorld Phan Thiết',
  'Hồ Tràm Strip', 'Aria Vũng Tàu',

  // === CẦN THƠ / MIỀN TÂY ===
  'Hưng Phú', 'Vạn Phát',

  // === Chủ đầu tư lớn (match nhiều dự án) ===
  'Novaland', 'Khang Điền', 'Nam Long', 'Hưng Thịnh',
  'Hưng Lộc Phát', 'Đất Xanh', 'Phát Đạt',
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

function detectProjectName(title: string, address: string): string | null {
  const haystack = (title + ' ' + address).toLowerCase()
  return KNOWN_PROJECTS.find((name) => haystack.includes(name.toLowerCase())) || null
}

async function _getProjectSummaries(limit = 12) {
  try {
    const supabase = await createClient()

    // Fetch in batches - only minimal columns for detection
    let allData: any[] = []
    let from = 0
    const batchSize = 1000

    while (true) {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, address, district, city, price, price_unit, images')
        .eq('status', 'published')
        .range(from, from + batchSize - 1)

      if (error) throw error
      if (!data || data.length === 0) break
      allData = allData.concat(data)
      if (data.length < batchSize) break
      from += batchSize
    }

    const grouped = new Map<string, any>()

    for (const item of allData) {
      const projectName = detectProjectName(item.title || '', item.address || '')
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
          ? group.minPriceFormatted + ' ' + group.minPriceUnit
          : 'Liên hệ',
      }))
      .sort((a, b) => b.propertyCount - a.propertyCount)
      .slice(0, limit)
  } catch (err) {
    console.error("Error fetching projects:", err)
    return []
  }
}

// Export with same name for compatibility
export { _getProjectSummaries as getProjectSummaries }

export async function getProjectListingsBySlug(slug: string, limit = 12): Promise<Property[]> {
  try {
    const supabase = await createClient()

    const targetProject = KNOWN_PROJECTS.find(name => slugify(name) === slug)
    if (!targetProject) return []

    const searchTerm = `%${targetProject.toLowerCase()}%`
    const { data, error } = await supabase
      .from('properties')
      .select(PROPERTY_CARD_COLUMNS)
      .eq('status', 'published')
      .or(`title.ilike.${searchTerm},address.ilike.${searchTerm}`)
      .limit(limit * 2)

    if (error || !data) throw error

    return data
      .filter((item: any) => {
        const name = detectProjectName(item.title || '', item.address || '')
        return name ? slugify(name) === slug : false
      })
      .slice(0, limit)
      .map(mapToProperty)
  } catch {
    return []
  }
}
