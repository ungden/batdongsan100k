import Link from 'next/link'

export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: { label: string; href: string; icon?: string }
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
        {subtitle && (
          <p className="text-sm text-on-surface/60 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors"
        >
          {action.icon && (
            <span className="material-symbols-outlined text-lg">
              {action.icon}
            </span>
          )}
          {action.label}
        </Link>
      )}
    </div>
  )
}
