"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Props {
  projectId: string
  onClose: () => void
}

export default function WriteReviewDialog({ projectId, onClose }: Props) {
  const [rating, setRating] = useState(5)
  const [locationRating, setLocationRating] = useState(5)
  const [qualityRating, setQualityRating] = useState(5)
  const [amenitiesRating, setAmenitiesRating] = useState(5)
  const [title, setTitle] = useState("")
  const [text, setText] = useState("")
  const [pros, setPros] = useState("")
  const [cons, setCons] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError("Bạn cần đăng nhập để đánh giá"); setSubmitting(false); return }

      const { error: insertError } = await supabase.from("project_reviews").insert({
        project_id: projectId,
        user_id: user.id,
        rating,
        location_rating: locationRating,
        quality_rating: qualityRating,
        amenities_rating: amenitiesRating,
        title,
        review_text: text,
        pros: pros.split("\n").filter(Boolean),
        cons: cons.split("\n").filter(Boolean),
        status: "approved",
      })

      if (insertError) throw insertError
      onClose()
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-on-surface">Viết đánh giá</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <RatingInput label="Đánh giá chung" value={rating} onChange={setRating} />
          <RatingInput label="Vị trí" value={locationRating} onChange={setLocationRating} />
          <RatingInput label="Chất lượng" value={qualityRating} onChange={setQualityRating} />
          <RatingInput label="Tiện ích" value={amenitiesRating} onChange={setAmenitiesRating} />

          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Tiêu đề</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface" placeholder="Tóm tắt đánh giá" />
          </div>

          <div>
            <label className="mb-1 block text-sm text-on-surface-variant">Nội dung đánh giá *</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} required rows={4}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface" placeholder="Chia sẻ trải nghiệm của bạn..." />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-secondary">Ưu điểm (mỗi dòng 1 ý)</label>
              <textarea value={pros} onChange={(e) => setPros(e.target.value)} rows={3}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-error">Nhược điểm (mỗi dòng 1 ý)</label>
              <textarea value={cons} onChange={(e) => setCons(e.target.value)} rows={3}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface" />
            </div>
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container">
              Hủy
            </button>
            <button type="submit" disabled={submitting || !text}
              className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-50">
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RatingInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-on-surface-variant">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => onChange(i)}>
            <span className={`material-symbols-outlined text-[22px] ${i <= value ? "text-amber-500" : "text-outline-variant"}`}>
              star
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
