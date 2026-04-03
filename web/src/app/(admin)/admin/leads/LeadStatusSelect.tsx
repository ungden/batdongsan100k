'use client'

import { useTransition } from 'react'
import { updateLeadStatus } from './actions'

const statuses = [
  { value: 'new', label: 'Moi' },
  { value: 'contacted', label: 'Da lien he' },
  { value: 'converted', label: 'Thanh cong' },
  { value: 'lost', label: 'That bai' },
]

export default function LeadStatusSelect({
  id,
  currentStatus,
}: {
  id: string
  currentStatus: string
}) {
  const [isPending, startTransition] = useTransition()

  return (
    <select
      value={currentStatus}
      disabled={isPending}
      onChange={(e) =>
        startTransition(() => updateLeadStatus(id, e.target.value))
      }
      className={`text-xs border border-gray-200 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20 ${
        isPending ? 'opacity-50' : ''
      }`}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  )
}
