import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/admin/StatCard'

export default async function AnalyticsPage() {
  const supabase = await createClient()

  const [
    { data: listings },
    { count: totalContacts },
    { count: totalListings },
    { count: totalUsers },
  ] = await Promise.all([
    supabase.from('properties').select('id, title, views, category, city').in('status', ['approved', 'published']),
    supabase.from('contact_requests').select('*', { count: 'estimated', head: true }),
    supabase.from('properties').select('*', { count: 'estimated', head: true }),
    supabase.from('profiles').select('*', { count: 'estimated', head: true }),
  ])

  const totalViews = (listings || []).reduce((sum, item) => sum + Number(item.views || 0), 0)
  const topListings = [...(listings || [])].sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).slice(0, 10)

  const categoryCounts: Record<string, number> = {}
  const cityCounts: Record<string, number> = {}
  for (const item of listings || []) {
    categoryCounts[item.category || 'khac'] = (categoryCounts[item.category || 'khac'] || 0) + 1
    cityCounts[item.city || 'Khác'] = (cityCounts[item.city || 'Khác'] || 0) + 1
  }

  const maxCategoryCount = Math.max(...Object.values(categoryCounts), 1)
  const maxCityCount = Math.max(...Object.values(cityCounts), 1)
  const categoryLabels: Record<string, string> = {
    apartment: 'Căn hộ',
    house: 'Nhà phố',
    land: 'Đất nền',
    room: 'Phòng trọ',
    khac: 'Khác',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Thống kê</h1>
        <p className="text-sm text-on-surface/60 mt-1">Tổng quan hoạt động hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Tổng lượt xem" value={totalViews} icon="visibility" color="bg-blue-500" />
        <StatCard title="Tổng liên hệ" value={totalContacts ?? 0} icon="contact_mail" color="bg-amber-500" />
        <StatCard title="Tổng tin" value={totalListings ?? 0} icon="apartment" color="bg-primary" />
        <StatCard title="Người dùng" value={totalUsers ?? 0} icon="group" color="bg-secondary" />
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-on-surface mb-4">Top 10 tin được xem nhiều</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">#</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Tin đăng</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Lượt xem</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Loại</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-on-surface/60 uppercase">Thành phố</th>
              </tr>
            </thead>
            <tbody>
              {!topListings.length ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-on-surface/40">Chưa có dữ liệu</td></tr>
              ) : topListings.map((item, index) => (
                <tr key={item.id} className={`border-b border-gray-50 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                  <td className="px-4 py-3 text-on-surface/50 font-medium">{index + 1}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{item.title}</td>
                  <td className="px-4 py-3 text-on-surface/70">{item.views ?? 0}</td>
                  <td className="px-4 py-3 text-on-surface/70">{categoryLabels[item.category || 'khac'] || item.category}</td>
                  <td className="px-4 py-3 text-on-surface/70">{item.city || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4">Phân bổ theo loại hình</h2>
          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([category, count]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface/70">{categoryLabels[category] || category}</span>
                  <span className="font-medium text-on-surface">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-primary rounded-full h-2.5" style={{ width: `${(count / maxCategoryCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4">Phân bổ theo thành phố</h2>
          <div className="space-y-3">
            {Object.entries(cityCounts).map(([city, count]) => (
              <div key={city}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface/70">{city}</span>
                  <span className="font-medium text-on-surface">{count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-secondary rounded-full h-2.5" style={{ width: `${(count / maxCityCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
