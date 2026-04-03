'use client'

import { useState, useTransition } from 'react'
import { bulkUpdateStatus, bulkDelete } from './actions'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

interface PropertyBulkActionsProps {
  selectedIds: string[]
  onClear: () => void
}

export default function PropertyBulkActions({
  selectedIds,
  onClear,
}: PropertyBulkActionsProps) {
  const [isPending, startTransition] = useTransition()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  if (selectedIds.length === 0) return null

  const handleBulkStatus = (status: string) => {
    startTransition(async () => {
      await bulkUpdateStatus(selectedIds, status)
      onClear()
    })
  }

  const handleBulkDelete = () => {
    startTransition(async () => {
      await bulkDelete(selectedIds)
      onClear()
      setShowDeleteConfirm(false)
    })
  }

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-[#001e40] text-white rounded-xl shadow-2xl px-6 py-3 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-200">
        <span className="text-sm font-medium">
          {selectedIds.length} muc da chon
        </span>
        <div className="w-px h-6 bg-white/20" />
        <button
          disabled={isPending}
          onClick={() => handleBulkStatus('published')}
          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          Dang tin
        </button>
        <button
          disabled={isPending}
          onClick={() => handleBulkStatus('archived')}
          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          Luu tru
        </button>
        <button
          disabled={isPending}
          onClick={() => setShowDeleteConfirm(true)}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
        >
          Xoa
        </button>
        <button
          onClick={onClear}
          className="p-1 hover:bg-white/10 rounded transition-colors"
          title="Bo chon"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Xoa bat dong san"
        message={`Ban co chac chan muon xoa ${selectedIds.length} bat dong san da chon? Hanh dong nay khong the hoan tac.`}
        confirmLabel="Xoa tat ca"
        danger
        loading={isPending}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  )
}
