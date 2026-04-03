'use client'

import { useActionState } from 'react'
import { submitContactAction } from './actions'

interface ContactFormProps {
  propertyId: string
  agentId: string
  agentPhone: string
}

export default function ContactForm({ propertyId, agentId, agentPhone }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { success: boolean; error?: string } | null, formData: FormData) => {
      return submitContactAction(formData)
    },
    null,
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="property_id" value={propertyId} />
      <input type="hidden" name="agent_id" value={agentId} />

      {state?.success && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium">
          Yêu cầu tư vấn đã được gửi thành công!
        </div>
      )}
      {state?.error && (
        <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm font-medium">
          {state.error}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold tracking-widest text-outline uppercase">
          Họ và tên
        </label>
        <input
          name="name"
          className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-1 focus:ring-primary-container text-sm"
          placeholder="Nhập họ và tên"
          type="text"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold tracking-widest text-outline uppercase">
          Số điện thoại
        </label>
        <input
          name="phone"
          className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-1 focus:ring-primary-container text-sm"
          placeholder="Nhập số điện thoại"
          type="tel"
          required
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold tracking-widest text-outline uppercase">
          Ghi chú
        </label>
        <textarea
          name="message"
          className="w-full px-4 py-3 bg-surface-container-low border-none rounded-md focus:ring-1 focus:ring-primary-container text-sm resize-none"
          placeholder="Tôi quan tâm đến bất động sản này..."
          rows={3}
        ></textarea>
      </div>
      <div className="flex flex-col gap-3 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary py-3 rounded-md font-bold shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <span className="material-symbols-outlined text-lg">mail</span>
          {isPending ? 'Đang gửi...' : 'Gửi yêu cầu tư vấn'}
        </button>
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${agentPhone.replace(/\s/g, '')}`}
            className="bg-surface-container-high text-on-primary-fixed-variant py-3 rounded-md font-bold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">call</span>
            Gọi ngay
          </a>
          <a
            href={`https://zalo.me/${agentPhone.replace(/\s/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0068FF] text-white py-3 rounded-md font-bold flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">chat</span>
            Zalo
          </a>
        </div>
      </div>
    </form>
  )
}
