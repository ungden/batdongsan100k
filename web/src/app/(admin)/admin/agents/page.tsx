import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PageHeader from '@/components/admin/PageHeader'

const PAGE_SIZE = 20

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const params = await searchParams
  const page = Math.max(1, parseInt(params.page || '1'))
  const offset = (page - 1) * PAGE_SIZE
  const supabase = await createClient()

  const { data: profiles, count } = await supabase
    .from('profiles')
    .select('*', { count: 'estimated' })
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1)

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE)

  return (
    <div>
      <PageHeader title="Người dùng / Môi giới" subtitle={`${count ?? 0} hồ sơ`} />

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Hồ sơ</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Điện thoại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Vai trò</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Gói</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Tham gia</th>
              </tr>
            </thead>
            <tbody>
              {(!profiles || profiles.length === 0) && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface/40">Chưa có hồ sơ nào</td></tr>
              )}
              {profiles?.map((profile, i) => (
                <tr key={profile.id} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {profile.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                          {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <span className="font-medium text-on-surface">{profile.full_name || 'Người dùng'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-on-surface/70">{profile.phone || '—'}</td>
                  <td className="px-4 py-3 text-on-surface/70">{profile.role || 'user'}</td>
                  <td className="px-4 py-3 text-on-surface/70">{profile.plan || 'free'}</td>
                  <td className="px-4 py-3 text-on-surface/50 text-xs">{new Date(profile.created_at).toLocaleDateString('vi-VN')}</td>
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
            {page > 1 && <Link href={`/admin/agents?page=${page - 1}`} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Trước</Link>}
            <span className="px-3 py-1 bg-[#001e40] text-white rounded text-sm">{page}</span>
            {page < totalPages && <Link href={`/admin/agents?page=${page + 1}`} className="px-3 py-1 bg-white border rounded text-sm hover:bg-gray-50">Sau</Link>}
          </div>
        </div>
      )}
    </div>
  )
}
