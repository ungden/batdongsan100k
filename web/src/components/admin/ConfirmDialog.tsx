'use client'

import { useEffect, useRef } from 'react'

interface Props {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Xac nhan',
  danger = true,
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    if (open) {
      dialogRef.current?.showModal()
    } else {
      dialogRef.current?.close()
    }
  }, [open])

  if (!open) return null

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 bg-transparent"
      onClose={onCancel}
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start gap-3 mb-4">
            {danger && (
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-red-600">
                  warning
                </span>
              </div>
            )}
            <div>
              <h3 className="text-lg font-bold text-on-surface">{title}</h3>
              <p className="text-sm text-on-surface/70 mt-1">{message}</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-on-surface/70 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Huy
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-primary hover:bg-primary-container'
              }`}
            >
              {loading && (
                <span className="material-symbols-outlined text-sm animate-spin">
                  progress_activity
                </span>
              )}
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
