"use client"

import { useCompare } from "./CompareContext"
import type { Property } from "@/lib/types"

export default function CompareButton({ property }: { property: Property }) {
  const { addItem, removeItem, isInCompare, canAddMore } = useCompare()
  const active = isInCompare(property.id)

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (active) {
      removeItem(property.id)
    } else {
      addItem(property)
    }
  }

  if (!active && !canAddMore) return null

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary-container text-on-primary-container"
          : "border-outline-variant bg-surface-container-low text-on-surface-variant hover:bg-surface-container"
      }`}
    >
      <span className="material-symbols-outlined text-[16px]">
        {active ? "check_circle" : "compare_arrows"}
      </span>
      {active ? "Dang so sanh" : "So sanh"}
    </button>
  )
}
