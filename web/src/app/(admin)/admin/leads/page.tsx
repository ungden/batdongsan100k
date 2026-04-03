import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'
import StatusBadge from '@/components/admin/StatusBadge'

const PAGE_SIZE = 20

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  const { data: leads, count } = await supabase
    .from('contact_requests')
    .select('*', { count: 'estimated' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <div>
      <PageHeader title="Liên hệ" subtitle={`${count ?? 0} liên hệ`} />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Họ tên</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Listing ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {(!leads || leads.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface/40">Chưa có liên hệ nào</td></tr>
              )}
              {leads?.map((lead, i) => (
                <tr key={lead.id} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 font-medium text-on-surface">{lead.name}</td>
                  <td className="px-4 py-3 text-on-surface/70">{lead.phone}</td>
                  <td className="px-4 py-3 text-on-surface/70">{lead.listing_id ?? '—'}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status || 'new'} /></td>
                  <td className="px-4 py-3 text-on-surface/50 text-xs">{new Date(lead.created_at).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-4">
          <span className="text-sm text-gray-500">Hiển thị {offset + 1}-{Math.min(offset + PAGE_SIZE, count || 0)} / {count} kết quả</span>
          <div className="flex gap-2">
            {page > 1 && <Link href={`/admin/leads?page=${page - 1}`} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Trước</Link>}
            <span className="px-3 py-1 bg-[#001e40] text-white rounded text-sm">{page}</span>
            {page < totalPages && <Link href={`/admin/leads?page=${page + 1}`} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Sau</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
