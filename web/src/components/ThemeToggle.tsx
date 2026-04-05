"use client"

import { useState } from "react"
import { useTheme } from "./ThemeContext"

const OPTIONS = [
  { value: "light" as const, label: "Sáng", icon: "light_mode" },
  { value: "dark" as const, label: "Tối", icon: "dark_mode" },
  { value: "system" as const, label: "Hệ thống", icon: "desktop_windows" },
]

export default function ThemeToggle() {
  const { theme, setTheme, resolved } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container"
      >
        <span className="material-symbols-outlined text-[20px]">
          {resolved === "dark" ? "dark_mode" : "light_mode"}
        </span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-xl border border-outline-variant bg-surface-container-low p-1 shadow-lg">
            {OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => { setTheme(o.value); setOpen(false) }}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm ${
                  theme === o.value ? "bg-primary-container text-on-primary-container" : "text-on-surface hover:bg-surface-container"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{o.icon}</span>
                {o.label}
                {theme === o.value && <span className="material-symbols-outlined ml-auto text-[16px]">check</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
