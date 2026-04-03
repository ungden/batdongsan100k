import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/admin/StatCard'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    { count: totalListings },
    { count: activeListings },
    { count: pendingListings },
    { count: totalProfiles },
    { count: newContacts },
    { count: todayListings },
    { data: recentListings },
    { data: listingTypes },
    { data: recentNotifications },
  ] = await Promise.all([
    supabase.from('listings').select('*', { count: 'estimated', head: true }),
    supabase.from('listings').select('*', { count: 'estimated', head: true }).in('status', ['approved', 'published']),
    supabase.from('listings').select('*', { count: 'estimated', head: true }).eq('status', 'pending'),
    supabase.from('profiles').select('*', { count: 'estimated', head: true }),
    supabase.from('contact_requests').select('*', { count: 'estimated', head: true }).gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    supabase.from('listings').select('*', { count: 'estimated', head: true }).gte('created_at', todayStart.toISOString()),
    supabase.from('listings').select('id, title, status, created_at, price, category').order('created_at', { ascending: false }).limit(5),
    supabase.from('listings').select('category'),
    supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(10),
  ])

  const typeCounts: Record<string, number> = {}
  listingTypes?.forEach((p) => {
    const key = p.category || 'khac'
    typeCounts[key] = (typeCounts[key] || 0) + 1
  })
  const maxTypeCount = Math.max(...Object.values(typeCounts), 1)

  const typeLabels: Record<string, string> = {
    apartment: 'Căn hộ',
    house: 'Nhà phố',
    land: 'Đất nền',
    room: 'Phòng trọ',
    khac: 'Khác',
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-on-surface mb-6">Tổng quan</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Tổng tin" value={totalListings ?? 0} icon="apartment" color="bg-primary" href="/admin/properties" />
        <StatCard title="Đang hiển thị" value={activeListings ?? 0} icon="check_circle" color="bg-secondary" href="/admin/properties?status=approved" />
        <StatCard title="Chờ duyệt" value={pendingListings ?? 0} icon="pending" color="bg-amber-500" href="/admin/properties?status=pending" />
        <StatCard title="Liên hệ mới" value={newContacts ?? 0} icon="contact_mail" color="bg-blue-500" href="/admin/leads" />
        <StatCard title="Mới hôm nay" value={todayListings ?? 0} icon="today" color="bg-emerald-500" href="/admin/properties" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-on-surface mb-4">Thao tác nhanh</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/properties/new" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors">
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm tin mới
          </Link>
          <Link href="/admin/leads" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
            <span className="material-symbols-outlined text-lg">contact_mail</span>
            Xem liên hệ
          </Link>
          <Link href="/admin/properties?status=pending" className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors">
            <span className="material-symbols-outlined text-lg">pending</span>
            Duyệt tin chờ
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-on-surface">Tin mới nhất</h2>
            <Link href="/admin/properties" className="text-sm text-primary hover:underline">Xem tất cả</Link>
          </div>
          <div className="space-y-3">
            {recentListings?.length ? recentListings.map((p) => (
              <Link key={p.id} href={`/admin/properties/${p.id}`} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-on-surface truncate">{p.title}</p>
                  <p className="text-xs text-on-surface/50 mt-0.5">{typeLabels[p.category || 'khac'] || p.category} · {(Number(p.price || 0) / 1000000000).toFixed(1).replace('.0', '')} tỷ</p>
                </div>
                <span className="material-symbols-outlined text-base text-on-surface/30 ml-2">chevron_right</span>
              </Link>
            )) : <p className="text-sm text-on-surface/40 text-center py-8">Chưa có dữ liệu</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4">Phân bổ theo loại</h2>
          <div className="space-y-3">
            {Object.entries(typeCounts).map(([type, count]) => (
              <div key={type}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface/70">{typeLabels[type] || type}</span>
                  <span className="font-medium text-on-surface">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-primary rounded-full h-2.5 transition-all" style={{ width: `${(count / maxTypeCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4">Thông báo gần đây</h2>
          <div className="space-y-3">
            {recentNotifications?.length ? recentNotifications.map((item) => (
              <div key={item.id} className="border-b border-gray-50 last:border-0 pb-3">
                <p className="text-sm font-medium text-on-surface">{item.title}</p>
                <p className="text-xs text-on-surface/50 mt-1">{new Date(item.created_at).toLocaleString('vi-VN')}</p>
              </div>
            )) : <p className="text-sm text-on-surface/40 text-center py-8">Chưa có thông báo</p>}
            <div className="pt-3 text-sm text-on-surface/60">Tổng hồ sơ người dùng: <span className="font-semibold text-on-surface">{totalProfiles ?? 0}</span></div>
          </div>
        </div>
      </div>
    </div>
  )
}
