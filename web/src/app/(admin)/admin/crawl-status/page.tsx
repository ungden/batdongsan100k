import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/admin/StatCard'

export const revalidate = 60 // refresh mỗi 60 giây

interface CrawlLog {
  id: string
  started_at: string
  completed_at: string | null
  status: string
  total_crawled: number
  total_inserted: number
  total_skipped: number
  total_failed: number
  created_agents: number
  source_stats: Record<string, number>
  args: Record<string, unknown>
  error_message: string | null
  created_at: string
}

function formatTime(iso: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function duration(start: string, end: string | null) {
  if (!end) return 'Đang chạy...'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  return `${mins} phút ${secs} giây`
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    success: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Thành công' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Lỗi' },
    running: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Đang chạy' },
  }
  const s = map[status] || map.running
  return `${s.bg} ${s.text}`
}

function statusLabel(status: string) {
  const labels: Record<string, string> = { success: 'Thành công', failed: 'Lỗi', running: 'Đang chạy' }
  return labels[status] || status
}

export default async function CrawlStatusPage() {
  const supabase = await createClient()

  const { data: logs } = await supabase
    .from('crawl_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const crawlLogs = (logs || []) as CrawlLog[]

  // Stats
  const latest = crawlLogs[0]
  const successCount = crawlLogs.filter(l => l.status === 'success').length
  const totalInsertedToday = crawlLogs
    .filter(l => l.status === 'success' && new Date(l.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, l) => sum + (l.total_inserted || 0), 0)

  // Aggregate source stats from latest successful crawl
  const latestSuccess = crawlLogs.find(l => l.status === 'success')
  const sourceStats = latestSuccess?.source_stats || {}

  // Count total properties from DB
  const { count: totalProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published')

  // Source distribution - not used in render but available for future

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Thu thập dữ liệu</h1>
        <p className="text-sm text-on-surface-variant mt-1">Theo dõi kết quả crawl tự động từ các nguồn BĐS</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Lần crawl gần nhất"
          value={latest ? formatTime(latest.started_at) : 'Chưa có'}
          icon="schedule"
          color="bg-blue-500"
        />
        <StatCard
          title="Tổng tin đăng trong DB"
          value={(totalProperties || 0).toLocaleString('vi-VN')}
          icon="database"
          color="bg-primary"
        />
        <StatCard
          title="Thêm mới hôm nay"
          value={totalInsertedToday}
          icon="add_circle"
          color="bg-emerald-500"
        />
        <StatCard
          title="Tỷ lệ thành công"
          value={crawlLogs.length > 0 ? `${Math.round((successCount / crawlLogs.length) * 100)}%` : '—'}
          icon="check_circle"
          color={successCount === crawlLogs.length ? 'bg-emerald-500' : 'bg-amber-500'}
        />
      </div>

      {/* Source Stats from latest crawl */}
      {Object.keys(sourceStats).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-on-surface mb-4">Nguồn dữ liệu (lần crawl gần nhất)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(sourceStats)
              .sort(([, a], [, b]) => (b as number) - (a as number))
              .map(([source, count]) => (
                <div key={source} className="rounded-xl border border-outline-variant/30 p-3">
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-medium">{source}</p>
                  <p className="text-xl font-bold text-on-surface mt-1">{(count as number).toLocaleString('vi-VN')}</p>
                  <p className="text-xs text-on-surface-variant">tin crawled</p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Crawl History Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/20">
          <h2 className="text-lg font-bold text-on-surface">Lịch sử thu thập</h2>
        </div>

        {crawlLogs.length === 0 ? (
          <div className="px-6 py-12 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-5xl mb-2 opacity-30">cloud_off</span>
            <p>Chưa có dữ liệu crawl nào. Hệ thống sẽ tự động crawl lúc 8:15 sáng (giờ VN) mỗi ngày.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant">
                  <th className="px-4 py-3 text-left font-semibold">Thời gian</th>
                  <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-semibold">Crawled</th>
                  <th className="px-4 py-3 text-right font-semibold">Thêm mới</th>
                  <th className="px-4 py-3 text-right font-semibold">Trùng lặp</th>
                  <th className="px-4 py-3 text-right font-semibold">Lỗi</th>
                  <th className="px-4 py-3 text-right font-semibold">Thời lượng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {crawlLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-4 py-3 text-on-surface whitespace-nowrap">
                      {formatTime(log.started_at)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(log.status)}`}>
                        {statusLabel(log.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface font-medium">
                      {(log.total_crawled || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      +{(log.total_inserted || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface-variant">
                      {(log.total_skipped || 0).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {log.total_failed > 0 ? (
                        <span className="text-red-600 font-medium">{log.total_failed}</span>
                      ) : (
                        <span className="text-on-surface-variant">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-on-surface-variant whitespace-nowrap">
                      {duration(log.started_at, log.completed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 text-sm text-on-surface-variant">
        <div className="flex items-start gap-2">
          <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
          <div>
            <p className="font-medium text-on-surface">Về hệ thống thu thập dữ liệu</p>
            <p className="mt-1">Crawler tự động chạy mỗi ngày lúc <strong>8:15 sáng (giờ VN)</strong> qua GitHub Actions. Dữ liệu được thu thập từ 8 nguồn: Chợ Tốt, Alonhadat, Homedy, Meeyland, Mogi, ODT, Muonnha, Cafeland. Các tin trùng lặp sẽ tự động bị loại bỏ.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
