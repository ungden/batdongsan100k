import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import PropertiesTable from './PropertiesTable'

const PAGE_SIZE = 20

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string; q?: string; sort?: string; order?: string }>
}) {
  const params = await searchParams
  const filterStatus = params.status
  const page = Math.max(1, parseInt(params.page || '1'))
  const q = params.q || ''
  const sortField = params.sort || 'created_at'
  const sortOrder = params.order || 'desc'
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  const allowedSortFields = new Set(['title', 'price', 'views', 'created_at', 'category'])
  const safeSortField = allowedSortFields.has(sortField) ? sortField : 'created_at'

  let query = supabase
    .from('properties')
    .select('*', { count: 'estimated' })
    .order(safeSortField, { ascending: sortOrder === 'asc' })

  if (filterStatus && filterStatus !== 'all') query = query.eq('status', filterStatus)
  if (q) query = query.ilike('title', `%${q}%`)
  query = query.range(offset, offset + PAGE_SIZE - 1)

  const { data: listings, count } = await query
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  const properties = (listings || []).map((item: any) => ({
    id: item.id,
    title: item.title,
    address: item.address,
    type: item.category,
    price: item.price,
    price_formatted: `${(Number(item.price || 0) / 1000000000).toFixed(1).replace('.0', '')} tỷ`,
    status: item.status,
    views_count: item.views || 0,
    created_at: item.created_at,
    images: item.images,
    agents: item.contact_name ? { name: item.contact_name } : null,
  }))

  const tabs = [
    { label: 'Tất cả', value: 'all' },
    { label: 'Đang đăng', value: 'approved' },
    { label: 'Chờ duyệt', value: 'pending' },
    { label: 'Từ chối', value: 'rejected' },
  ]

  const currentTab = filterStatus || 'all'

  function buildHref(tabValue: string) {
    const p = new URLSearchParams()
    if (tabValue !== 'all') p.set('status', tabValue)
    if (q) p.set('q', q)
    const qs = p.toString()
    return `/admin/properties${qs ? `?${qs}` : ''}`
  }

  function buildPageHref(targetPage: number) {
    const p = new URLSearchParams()
    if (filterStatus && filterStatus !== 'all') p.set('status', filterStatus)
    if (q) p.set('q', q)
    if (targetPage > 1) p.set('page', String(targetPage))
    const qs = p.toString()
    return `/admin/properties${qs ? `?${qs}` : ''}`
  }

  return (
    <div>
      <PageHeader
        title="Bất động sản"
        subtitle={`${count ?? 0} tin đăng`}
        action={{ label: 'Thêm tin mới', href: '/admin/properties/new', icon: 'add' }}
      />

      <form method="GET" action="/admin/properties" className="mb-4">
        {filterStatus && filterStatus !== 'all' && <input type="hidden" name="status" value={filterStatus} />}
        <div className="relative max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">search</span>
          <input type="text" name="q" defaultValue={q} placeholder="Tìm kiếm theo tiêu đề..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white" />
        </div>
      </form>

      <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <Link key={tab.value} href={buildHref(tab.value)} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentTab === tab.value ? 'bg-primary text-white' : 'text-on-surface/60 hover:text-on-surface hover:bg-gray-50'}`}>
            {tab.label}
          </Link>
        ))}
      </div>

      <PropertiesTable properties={properties} />

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <span className="text-sm text-gray-500">Hiển thị {offset + 1}-{Math.min(offset + PAGE_SIZE, count || 0)} / {count} kết quả</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={buildPageHref(page - 1)} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Trước</Link>}
            <span className="px-3 py-1 bg-[#001e40] text-white rounded text-sm">{page}</span>
            {page < totalPages && <Link href={buildPageHref(page + 1)} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Sau</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
