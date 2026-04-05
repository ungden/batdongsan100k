"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import WriteReviewDialog from "./WriteReviewDialog"

interface Review {
  id: string
  rating: number
  location_rating: number
  quality_rating: number
  amenities_rating: number
  title: string
  review_text: string
  pros: string[]
  cons: string[]
  is_verified_buyer: boolean
  helpful_count: number
  created_at: string
  profiles?: { full_name: string } | null
}

interface Stats {
  avg: number
  total: number
  distribution: Record<number, number>
  avgLocation: number
  avgQuality: number
  avgAmenities: number
}

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const cls = size === "lg" ? "text-[20px]" : "text-[14px]"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`material-symbols-outlined ${cls} ${i <= Math.round(rating) ? "text-amber-500" : "text-outline-variant"}`}>
          star
        </span>
      ))}
    </div>
  )
}

function timeAgo(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (days === 0) return "Hom nay"
  if (days === 1) return "Hom qua"
  if (days < 30) return `${days} ngay truoc`
  if (days < 365) return `${Math.floor(days / 30)} thang truoc`
  return `${Math.floor(days / 365)} nam truoc`
}

export default function ReviewsSection({ projectId }: { projectId: string }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [sort, setSort] = useState<"recent" | "helpful" | "rating">("recent")
  const [showDialog, setShowDialog] = useState(false)

  const fetchReviews = useCallback(async () => {
    const supabase = createClient()
    let query = supabase
      .from("project_reviews")
      .select("*, profiles(full_name)")
      .eq("project_id", projectId)
      .eq("status", "approved")

    if (sort === "helpful") query = query.order("helpful_count", { ascending: false })
    else if (sort === "rating") query = query.order("rating", { ascending: false })
    else query = query.order("created_at", { ascending: false })

    const { data } = await query.limit(20)
    if (!data) return

    setReviews(data as Review[])

    // Compute stats
    if (data.length > 0) {
      const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      let sumR = 0, sumL = 0, sumQ = 0, sumA = 0
      for (const r of data) {
        sumR += r.rating
        sumL += r.location_rating || 0
        sumQ += r.quality_rating || 0
        sumA += r.amenities_rating || 0
        dist[r.rating] = (dist[r.rating] || 0) + 1
      }
      const n = data.length
      setStats({ avg: sumR / n, total: n, distribution: dist, avgLocation: sumL / n, avgQuality: sumQ / n, avgAmenities: sumA / n })
    }
  }, [projectId, sort])

  useEffect(() => { fetchReviews() }, [fetchReviews])

  async function handleHelpful(reviewId: string) {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("review_helpful_votes").insert({ review_id: reviewId, user_id: user.id })
    setReviews((prev) => prev.map((r) => r.id === reviewId ? { ...r, helpful_count: r.helpful_count + 1 } : r))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-on-surface">Danh gia & Nhan xet</h2>
        <button onClick={() => setShowDialog(true)}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">
          Viet danh gia
        </button>
      </div>

      {stats && stats.total > 0 ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Overall */}
          <div className="flex flex-col items-center rounded-2xl border border-outline-variant bg-surface-container-low p-6">
            <span className="text-5xl font-bold text-on-surface">{stats.avg.toFixed(1)}</span>
            <Stars rating={stats.avg} size="lg" />
            <span className="mt-1 text-sm text-on-surface-variant">{stats.total} danh gia</span>
            <div className="mt-4 w-full space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-on-surface-variant">{star}</span>
                  <div className="h-2 flex-1 rounded-full bg-surface-container">
                    <div className="h-full rounded-full bg-amber-500"
                      style={{ width: `${stats.total > 0 ? (stats.distribution[star] / stats.total * 100) : 0}%` }} />
                  </div>
                  <span className="w-5 text-right text-on-surface-variant">{stats.distribution[star] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Category ratings */}
          <div className="space-y-3 rounded-2xl border border-outline-variant bg-surface-container-low p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-on-surface">Danh gia theo tieu chi</h3>
            {[
              { label: "Vi tri", icon: "location_on", value: stats.avgLocation },
              { label: "Chat luong", icon: "verified", value: stats.avgQuality },
              { label: "Tien ich", icon: "fitness_center", value: stats.avgAmenities },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">{c.icon}</span>
                <span className="w-20 text-sm text-on-surface-variant">{c.label}</span>
                <div className="h-2 flex-1 rounded-full bg-surface-container">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(c.value / 5) * 100}%` }} />
                </div>
                <span className="w-8 text-right text-sm font-semibold text-on-surface">{c.value.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-12 text-center">
          <span className="material-symbols-outlined mb-2 text-5xl text-on-surface-variant/30">rate_review</span>
          <p className="text-on-surface-variant">Chua co danh gia nao. Hay la nguoi dau tien!</p>
        </div>
      )}

      {/* Sort + Reviews list */}
      {reviews.length > 0 && (
        <>
          <div className="flex gap-2">
            {(["recent", "helpful", "rating"] as const).map((s) => (
              <button key={s} onClick={() => setSort(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  sort === s ? "bg-primary text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
                }`}>
                {s === "recent" ? "Moi nhat" : s === "helpful" ? "Huu ich" : "Cao nhat"}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-outline-variant bg-surface p-4">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-container text-xs font-bold text-on-primary-container">
                    {(r.profiles?.full_name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-on-surface">{r.profiles?.full_name || "Nguoi dung"}</span>
                      {r.is_verified_buyer && (
                        <span className="rounded bg-secondary-container px-1.5 py-0.5 text-[10px] font-bold text-on-secondary-container">
                          Da mua
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-on-surface-variant">{timeAgo(r.created_at)}</span>
                  </div>
                  <div className="ml-auto"><Stars rating={r.rating} /></div>
                </div>

                {r.title && <p className="mb-1 font-semibold text-on-surface">{r.title}</p>}
                <p className="text-sm text-on-surface-variant">{r.review_text}</p>

                {(r.pros?.length > 0 || r.cons?.length > 0) && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {r.pros?.length > 0 && (
                      <div className="rounded-lg bg-secondary-container/20 p-2.5">
                        <p className="mb-1 text-xs font-semibold text-secondary">Uu diem</p>
                        {r.pros.map((p, i) => <p key={i} className="text-xs text-on-surface-variant">+ {p}</p>)}
                      </div>
                    )}
                    {r.cons?.length > 0 && (
                      <div className="rounded-lg bg-error-container/20 p-2.5">
                        <p className="mb-1 text-xs font-semibold text-error">Nhuoc diem</p>
                        {r.cons.map((c, i) => <p key={i} className="text-xs text-on-surface-variant">- {c}</p>)}
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => handleHelpful(r.id)}
                  className="mt-3 flex items-center gap-1 text-xs text-on-surface-variant hover:text-primary">
                  <span className="material-symbols-outlined text-[14px]">thumb_up</span>
                  Huu ich ({r.helpful_count})
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {showDialog && <WriteReviewDialog projectId={projectId} onClose={() => { setShowDialog(false); fetchReviews() }} />}
    </div>
  )
}
