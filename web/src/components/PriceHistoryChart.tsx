"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface Props {
  launchPrice: number
  currentPrice: number
  projectName: string
  monthsAgo?: number
}

export default function PriceHistoryChart({ launchPrice, currentPrice, projectName, monthsAgo = 24 }: Props) {
  const data = useMemo(() => {
    if (!launchPrice || !currentPrice || launchPrice <= 0) return []

    const points: { month: string; price: number; forecast?: number }[] = []
    const now = new Date()
    const monthlyGrowth = Math.pow(currentPrice / launchPrice, 1 / monthsAgo) - 1

    for (let i = monthsAgo; i >= 0; i--) {
      const d = new Date(now)
      d.setMonth(d.getMonth() - i)
      const progress = (monthsAgo - i) / monthsAgo
      const sCurve = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2
      const price = launchPrice + (currentPrice - launchPrice) * sCurve
      points.push({
        month: `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`,
        price: Math.round(price * 10) / 10,
      })
    }

    for (let i = 1; i <= 6; i++) {
      const d = new Date(now)
      d.setMonth(d.getMonth() + i)
      const forecastPrice = currentPrice * Math.pow(1 + monthlyGrowth, i)
      points.push({
        month: `${d.getMonth() + 1}/${d.getFullYear().toString().slice(2)}`,
        price: Math.round(currentPrice * 10) / 10,
        forecast: Math.round(forecastPrice * 10) / 10,
      })
    }

    return points
  }, [launchPrice, currentPrice, monthsAgo])

  if (data.length === 0) return null

  const growth = launchPrice > 0 ? ((currentPrice - launchPrice) / launchPrice * 100).toFixed(1) : "0"
  const monthlyAvg = launchPrice > 0 ? ((currentPrice - launchPrice) / monthsAgo).toFixed(1) : "0"

  return (
    <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-on-surface">Biến động giá - {projectName}</h3>
        <div className="flex gap-3 text-xs">
          <span className="text-on-surface-variant">Tăng trưởng: <span className="font-semibold text-secondary">+{growth}%</span></span>
          <span className="text-on-surface-variant">TB tháng: <span className="font-semibold">+{monthlyAvg} triệu/m²</span></span>
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#001e40" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#001e40" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#006c47" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#006c47" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}tr`} domain={["auto", "auto"]} />
            <Tooltip formatter={(v) => `${v} triệu/m²`} />
            <ReferenceLine y={currentPrice} stroke="#001e40" strokeDasharray="3 3" label={{ value: "Hiện tại", fontSize: 10 }} />
            <Area type="monotone" dataKey="price" stroke="#001e40" fill="url(#priceGrad)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="forecast" stroke="#006c47" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="6 3" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex gap-4 text-xs text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 bg-[#001e40]" />
          Giá thực tế
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-0.5 w-4 border-b border-dashed border-[#006c47]" />
          Dự báo
        </div>
      </div>
    </div>
  )
}
