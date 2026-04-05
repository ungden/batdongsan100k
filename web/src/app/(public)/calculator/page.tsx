"use client"

import { useState } from "react"
import dynamic from "next/dynamic"

const MortgageCalculator = dynamic(() => import("@/components/calculator/MortgageCalculator"), { ssr: false })
const ROICalculator = dynamic(() => import("@/components/calculator/ROICalculator"), { ssr: false })

const TABS = [
  { key: "mortgage", label: "Tính trả góp", icon: "account_balance" },
  { key: "roi", label: "Phân tích đầu tư", icon: "trending_up" },
] as const

export default function CalculatorPage() {
  const [tab, setTab] = useState<"mortgage" | "roi">("mortgage")

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Công cụ tính toán</h1>
        <p className="mt-1 text-on-surface-variant">Tính toán trả góp và phân tích hiệu quả đầu tư bất động sản</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-2 rounded-xl bg-surface-container-low p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
              tab === t.key ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-outline-variant bg-surface p-6">
        {tab === "mortgage" ? <MortgageCalculator /> : <ROICalculator />}
      </div>
    </div>
  )
}
