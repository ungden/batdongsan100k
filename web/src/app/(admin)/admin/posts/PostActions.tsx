'use client'

import { togglePublished, deletePost } from './actions'
import { useState, useTransition } from 'react'
import ConfirmDialog from '@/components/admin/ConfirmDialog'

export default function PostActions({
  id,
  isPublished,
}: {
  id: string
  isPublished: boolean
}) {
  const [isPending, startTransition] = useTransition()
  const [showDelete, setShowDelete] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={isPending}
        onClick={() => startTransition(() => togglePublished(id))}
        className="text-xs text-on-surface/50 hover:text-on-surface transition-colors disabled:opacity-50"
        title={isPublished ? 'Go nhap' : 'Xuat ban'}
      >
        <span className="material-symbols-outlined text-base">
          {isPublished ? 'unpublished' : 'publish'}
        </span>
      </button>
      <button
        disabled={isPending}
        onClick={() => setShowDelete(true)}
        className="text-xs text-red-500 hover:text-red-700 transition-colors disabled:opacity-50"
        title="Xoa"
      >
        <span className="material-symbols-outlined text-base">delete</span>
      </button>

      <ConfirmDialog
        open={showDelete}
        title="Xoa bai viet"
        message="Ban co chac chan muon xoa bai viet nay? Hanh dong nay khong the hoan tac."
        confirmLabel="Xoa"
        danger
        loading={isPending}
        onConfirm={() => {
          startTransition(async () => {
            await deletePost(id)
            setShowDelete(false)
          })
        }}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}
