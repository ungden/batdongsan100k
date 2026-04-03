'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateAgent, deleteAgent } from '../actions'
import PageHeader from '@/components/admin/PageHeader'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function EditAgentPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [agent, setAgent] = useState<Record<string, unknown> | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('agents')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => {
        setAgent(data)
        setLoading(false)
      })
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-symbols-outlined animate-spin text-3xl text-on-surface/30">
          progress_activity
        </span>
      </div>
    )
  }

  if (!agent) {
    return <div className="text-center py-20 text-on-surface/50">Khong tim thay nhan vien</div>
  }

  const inputClass =
    'w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
  const labelClass = 'block text-sm font-medium text-on-surface mb-1.5'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Chinh sua nhan vien</h1>
          <p className="text-sm text-on-surface/60 mt-1">{agent.name as string}</p>
        </div>
        <button
          onClick={() => setShowDelete(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
        >
          <span className="material-symbols-outlined text-lg">delete</span>
          Xoa
        </button>
      </div>

      <form
        action={async (formData) => {
          setSubmitting(true)
          setError(null)
          try {
            await updateAgent(agent.id as string, formData)
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
            <input name="name" required className={inputClass} defaultValue={agent.name as string} />
          </div>
          <div>
            <label className={labelClass}>Email *</label>
            <input name="email" type="email" required className={inputClass} defaultValue={agent.email as string} />
          </div>
          <div>
            <label className={labelClass}>So dien thoai</label>
            <input name="phone" className={inputClass} defaultValue={agent.phone as string} />
          </div>
          <div>
            <label className={labelClass}>Gioi thieu</label>
            <textarea name="bio" rows={3} className={inputClass} defaultValue={agent.bio as string} />
          </div>
          <div>
            <label className={labelClass}>URL anh dai dien</label>
            <input name="avatar" className={inputClass} defaultValue={agent.avatar as string} />
          </div>
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-on-surface cursor-pointer">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={agent.is_active as boolean}
                className="rounded"
              />
              Dang hoat dong
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => router.push('/admin/agents')}
            className="px-6 py-2.5 border border-gray-200 text-on-surface/70 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Huy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-container transition-colors disabled:opacity-50"
          >
            {submitting ? 'Dang luu...' : 'Luu thay doi'}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={showDelete}
        title="Xoa nhan vien"
        message="Ban co chac chan muon xoa nhan vien nay? Hanh dong nay khong the hoan tac."
        confirmLabel="Xoa"
        danger
        loading={deleteLoading}
        onConfirm={async () => {
          setDeleteLoading(true)
          await deleteAgent(agent.id as string)
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
