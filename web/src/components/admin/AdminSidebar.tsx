'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  icon: string
  label: string
  href: string
  badgeKey?: string
}

const navItems: NavItem[] = [
  { icon: 'dashboard', label: 'Tổng quan', href: '/admin' },
  { icon: 'apartment', label: 'Bất động sản', href: '/admin/properties', badgeKey: 'pending_listings' },
  { icon: 'group', label: 'Người dùng', href: '/admin/users' },
  { icon: 'contact_mail', label: 'Liên hệ', href: '/admin/leads', badgeKey: 'new_contacts' },
  { icon: 'article', label: 'Bài viết', href: '/admin/posts' },
  { icon: 'bar_chart', label: 'Thống kê', href: '/admin/analytics' },
  { icon: 'settings', label: 'Cài đặt', href: '/admin/settings' },
]

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [badges, setBadges] = useState<Record<string, number>>({})
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from('listings').select('*', { count: 'estimated', head: true }).eq('status', 'pending'),
      supabase.from('contact_requests').select('*', { count: 'estimated', head: true }).eq('status', 'new'),
    ]).then(([pendingRes, contactRes]) => {
      setBadges({
        pending_listings: pendingRes.count ?? 0,
        new_contacts: contactRes.count ?? 0,
      })
    })
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <aside className={`${collapsed ? 'w-20' : 'w-64'} bg-[#001e40] text-white flex flex-col shrink-0 transition-all duration-300 h-screen sticky top-0`}>
      <div className="h-16 flex items-center px-5 border-b border-white/10">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl text-white">home_work</span>
          {!collapsed && <span className="text-lg font-bold tracking-tight"><span className="text-white">Titan</span><span className="text-emerald-400">Home</span></span>}
        </Link>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const badgeCount = item.badgeKey ? badges[item.badgeKey] ?? 0 : 0
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(item.href) ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`} title={collapsed ? item.label : undefined}>
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {badgeCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">{badgeCount}</span>}
                </>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-white/10 space-y-1">
        <button onClick={() => setCollapsed(!collapsed)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors">
          <span className="material-symbols-outlined text-xl">{collapsed ? 'chevron_right' : 'chevron_left'}</span>
          {!collapsed && <span>Thu gọn</span>}
        </button>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-white/5 w-full transition-colors">
          <span className="material-symbols-outlined text-xl">logout</span>
          {!collapsed && <span>Đăng xuất</span>}
        </button>
      </div>
    </aside>
  )
}
