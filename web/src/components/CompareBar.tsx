"use client"

import Link from "next/link"
import { useCompare } from "./CompareContext"

export default function CompareBar() {
  const { items, removeItem, clearAll } = useCompare()

  if (items.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant bg-surface-container-low/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {items.length}
          </span>
          <div className="hidden gap-2 sm:flex">
            {items.map((p) => (
              <div key={p.id} className="flex items-center gap-1 rounded-lg bg-surface-container px-2 py-1 text-xs">
                <span className="max-w-[120px] truncate">{p.title}</span>
                <button onClick={() => removeItem(p.id)} className="text-on-surface-variant hover:text-error">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            ))}
          </div>
          <span className="text-sm text-on-surface-variant sm:hidden">
            {items.length} BDS dang so sanh
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearAll}
            className="rounded-lg px-3 py-1.5 text-sm text-on-surface-variant hover:bg-surface-container"
          >
            Xoa het
          </button>
          <Link
            href="/compare"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
          >
            So sanh ngay
          </Link>
        </div>
      </div>
    </div>
  )
}
