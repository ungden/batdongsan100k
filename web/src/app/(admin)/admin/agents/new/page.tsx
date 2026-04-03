'use client'

import { useState } from 'react'
import { createAgent } from '../actions'
import PageHeader from '@/components/admin/PageHeader'

export default function NewAgentPage() {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
  const labelClass = 'block text-sm font-medium text-on-surface mb-1.5'

  return (
    <div>
      <PageHeader title="Them nhan vien moi" />

      <form
        action={async (formData) => {
          setSubmitting(true)
          setError(null)
          try {
            await createAgent(formData)
          } catch (e) {
            setError(e instanceof Error ? e.message : 'Co loi xay ra')
            setSubmitting(false)
          }
        }}
        className="bg-white rounded-xl shadow-sm p-6 max-w-2xl"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Ho va ten *</label>
            <input name="name" required className={inputClass} placeholder="Nguyen Van A" />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input name="email" type="email" required className={inputClass} placeholder="email@example.com" />
          </div>
          <div>
            <label className={labelClass}>So dien thoai</label>
            <input name="phone" className={inputClass} placeholder="0901 234 567" />
          </div>
          <div>
            <label className={labelClass}>Gioi thieu</label>
            <textarea name="bio" rows={3} className={inputClass} placeholder="Gioi thieu ngan ve nhan vien..." />
          </div>
          <div>
            <label className={labelClass}>URL anh dai dien</label>
            <input name="avatar" className={inputClass} placeholder="https://example.com/avatar.jpg" />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface cursor-pointer">
              <input type="checkbox" name="is_active" defaultChecked className="rounded" />
              Dang hoat dong
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {submitting ? 'Dang luu...' : 'Tao nhan vien'}
          </button>
        </div>
      </form>
    </div>
  )
}
