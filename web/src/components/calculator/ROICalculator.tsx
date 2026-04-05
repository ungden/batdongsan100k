"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

function formatVND(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1).replace(/\.0$/, "")} ty`
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)} tr`
  return `${value.toLocaleString("vi-VN")} d`
}

export default function ROICalculator() {
  const [price, setPrice] = useState(3_000_000_000)
  const [downPct, setDownPct] = useState(30)
  const [rate, setRate] = useState(8)
  const [term, setTerm] = useState(20)
  const [rentalYield, setRentalYield] = useState(5)
  const [appreciation, setAppreciation] = useState(6)

  const result = useMemo(() => {
    const downAmount = price * (downPct / 100)
    const loan = price - downAmount
    const monthlyRate = rate / 100 / 12
    const months = term * 12
    const monthly = monthlyRate > 0
      ? (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : loan / months

    const monthlyRent = (price * (rentalYield / 100)) / 12
    const monthlyCashFlow = monthlyRent - monthly

    // 10-year forecast
    const years: { year: number; propertyValue: number; equity: number; rentalIncome: number; cumulativeCashFlow: number }[] = []
    let cumCashFlow = -downAmount
    let remainingLoan = loan

    for (let y = 1; y <= 10; y++) {
      const currentValue = price * Math.pow(1 + appreciation / 100, y)
      const yearlyRent = (price * Math.pow(1 + appreciation / 100, y - 1)) * (rentalYield / 100)
      const yearlyPayment = monthly * 12

      // Simplified remaining loan (linear approximation)
      const principalPaid = y <= term ? (loan / term) : 0
      remainingLoan = Math.max(0, remainingLoan - principalPaid)

      cumCashFlow += yearlyRent - yearlyPayment
      years.push({
        year: y,
        propertyValue: Math.round(currentValue / 1e6),
        equity: Math.round((currentValue - remainingLoan) / 1e6),
        rentalIncome: Math.round(yearlyRent / 1e6),
        cumulativeCashFlow: Math.round(cumCashFlow / 1e6),
      })
    }

    // 5-year comparison with other investments
    const totalInvestment = downAmount
    const bdsReturn = price * Math.pow(1 + appreciation / 100, 5) - price + (price * rentalYield / 100) * 5
    const stockReturn = totalInvestment * Math.pow(1.12, 5) - totalInvestment
    const goldReturn = totalInvestment * Math.pow(1.08, 5) - totalInvestment
    const savingsReturn = totalInvestment * Math.pow(1.05, 5) - totalInvestment

    const comparison = [
      { name: "BDS", value: Math.round(bdsReturn / 1e6), roi: ((bdsReturn / totalInvestment) * 100).toFixed(0) },
      { name: "Chung khoan", value: Math.round(stockReturn / 1e6), roi: ((stockReturn / totalInvestment) * 100).toFixed(0) },
      { name: "Vang", value: Math.round(goldReturn / 1e6), roi: ((goldReturn / totalInvestment) * 100).toFixed(0) },
      { name: "Tiet kiem", value: Math.round(savingsReturn / 1e6), roi: ((savingsReturn / totalInvestment) * 100).toFixed(0) },
    ]

    const totalROI5y = ((bdsReturn / totalInvestment) * 100)
    const annualROI = totalROI5y / 5

    return { downAmount, monthly, monthlyRent, monthlyCashFlow, years, comparison, totalROI5y, annualROI }
  }, [price, downPct, rate, term, rentalYield, appreciation])

  return (
    <div className="space-y-8">
      {/* Inputs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SliderInput label="Gia BDS" value={price} onChange={setPrice} min={500e6} max={50e9} step={100e6} format={formatVND} />
        <SliderInput label="Tra truoc (%)" value={downPct} onChange={setDownPct} min={10} max={70} step={5} format={(v) => `${v}%`} />
        <SliderInput label="Lai suat (%/nam)" value={rate} onChange={setRate} min={4} max={15} step={0.5} format={(v) => `${v}%`} />
        <SliderInput label="Ky han vay (nam)" value={term} onChange={setTerm} min={5} max={30} step={1} format={(v) => `${v} nam`} />
        <SliderInput label="Ty suat cho thue (%/nam)" value={rentalYield} onChange={setRentalYield} min={1} max={12} step={0.5} format={(v) => `${v}%`} />
        <SliderInput label="Tang gia BDS (%/nam)" value={appreciation} onChange={setAppreciation} min={0} max={15} step={1} format={(v) => `${v}%`} />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KPI label="Tra gop/thang" value={formatVND(result.monthly)} />
        <KPI label="Thu nhap thue/thang" value={formatVND(result.monthlyRent)} />
        <KPI label="Dong tien rong/thang" value={formatVND(result.monthlyCashFlow)}
          positive={result.monthlyCashFlow >= 0} />
        <KPI label="ROI 5 nam" value={`${result.totalROI5y.toFixed(0)}%`} highlight />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 10-year forecast */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <h4 className="mb-3 text-sm font-semibold text-on-surface">Du bao 10 nam (trieu VND)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.years}>
                <XAxis dataKey="year" tick={{ fontSize: 11 }} tickFormatter={(v) => `Nam ${v}`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}tr`} />
                <Tooltip formatter={(v) => `${v} trieu`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="equity" name="Von chu so huu" fill="#001e40" radius={[3, 3, 0, 0]} />
                <Bar dataKey="rentalIncome" name="Thu nhap thue/nam" fill="#006c47" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Investment comparison */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <h4 className="mb-3 text-sm font-semibold text-on-surface">So sanh kenh dau tu (5 nam, trieu VND)</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={result.comparison} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}tr`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => `${v} trieu`} />
                <Bar dataKey="value" name="Loi nhuan" fill="#001e40" radius={[0, 4, 4, 0]}>
                  {result.comparison.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#006c47" : "#001e40"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.comparison.map((c) => (
              <span key={c.name} className="rounded-lg bg-surface-container px-2 py-1 text-xs text-on-surface-variant">
                {c.name}: <span className="font-semibold">+{c.roi}%</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Need to import Cell
import { Cell } from "recharts"

function SliderInput({ label, value, onChange, min, max, step, format }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; format: (v: number) => string
}) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-3">
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-semibold text-on-surface">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-container accent-primary" />
    </div>
  )
}

function KPI({ label, value, highlight, positive }: { label: string; value: string; highlight?: boolean; positive?: boolean }) {
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-primary bg-primary-container/30" : "border-outline-variant bg-surface-container-low"}`}>
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : positive === false ? "text-error" : positive === true ? "text-secondary" : "text-on-surface"}`}>
        {value}
      </p>
    </div>
  )
}
