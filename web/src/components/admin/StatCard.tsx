import Link from 'next/link'

export default function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'bg-primary',
  href,
}: {
  title: string
  value: string | number
  icon: string
  trend?: { value: number; isUp: boolean }
  color?: string
  href?: string
}) {
  const content = (
    <>
      <div
        className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shrink-0`}
      >
        <span className="material-symbols-outlined text-white text-2xl">
          {icon}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-on-surface/60 mb-1">{title}</p>
        <p className="text-2xl font-bold text-on-surface">{value}</p>
        {trend && (
          <div className="flex items-center gap-1 mt-1">
            <span
              className={`material-symbols-outlined text-sm ${
                trend.isUp ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isUp ? 'trending_up' : 'trending_down'}
            </span>
            <span
              className={`text-xs font-medium ${
                trend.isUp ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.value}%
            </span>
          </div>
        )}
      </div>
    </>
  )

  if (href) {
    return (
      <Link
        href={href}
        className="bg-white rounded-xl shadow-sm p-6 flex items-start gap-4 hover:shadow-md hover:scale-[1.02] transition-all"
      >
        {content}
      </Link>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 flex items-start gap-4">
      {content}
    </div>
  )
}
