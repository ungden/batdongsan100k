"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link?: string
  read: boolean
  created_at: string
}

const TYPE_ICONS: Record<string, string> = {
  price_alert: "trending_up",
  new_listing: "home",
  system: "info",
  contact_update: "chat",
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "Vua xong"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} phut truoc`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} gio truoc`
  const days = Math.floor(hours / 24)
  return `${days} ngay truoc`
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const fetchNotifications = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      if (data) setNotifications(data)
    } catch {}
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  async function markAsRead(id: string) {
    const supabase = createClient()
    await supabase.from("notifications").update({ read: true }).eq("id", id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
  }

  async function markAllAsRead() {
    const supabase = createClient()
    const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await supabase.from("notifications").update({ read: true }).in("id", unreadIds)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[20px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-2xl border border-outline-variant bg-surface-container-low shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-outline-variant px-4 py-3">
              <h3 className="text-sm font-bold text-on-surface">Thong bao</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs font-medium text-primary hover:underline">
                  Doc tat ca
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-on-surface-variant">
                  Chua co thong bao nao
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`flex gap-3 border-b border-outline-variant/50 px-4 py-3 transition-colors hover:bg-surface-container ${
                      !n.read ? "bg-primary-container/10" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined mt-0.5 text-[18px] text-on-surface-variant">
                      {TYPE_ICONS[n.type] || "notifications"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm ${!n.read ? "font-semibold text-on-surface" : "text-on-surface-variant"}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-on-surface-variant">{n.message}</p>
                      <p className="mt-1 text-[10px] text-on-surface-variant/60">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read && <div className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
