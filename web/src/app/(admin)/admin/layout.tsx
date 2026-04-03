import { headers } from 'next/headers'
import AdminSidebar from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin | TitanHome',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''

  // Login page renders without shell
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="text-sm text-on-surface/60">
            <span className="font-medium text-on-surface">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="material-symbols-outlined text-on-surface/70">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 bg-[#f3f3f4] p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
