"use client"

import { useState, useMemo } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const PRESETS = [
  { label: "An toàn", down: 50, rate: 7, term: 15 },
  { label: "Cân bằng", down: 30, rate: 8, term: 20 },
  { label: "Tích cực", down: 20, rate: 8.5, term: 25 },
  { label: "Đầu tư", down: 20, rate: 9, term: 30 },
]

const COLORS = ["#001e40", "#006c47", "#ba1a1a"]

function formatVND(value: number) {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1).replace(/\.0$/, "")} tỷ`
  if (value >= 1e6) return `${(value / 1e6).toFixed(0)} triệu`
  return `${value.toLocaleString("vi-VN")} đ`
}

export default function MortgageCalculator() {
  const [price, setPrice] = useState(3_000_000_000)
  const [downPct, setDownPct] = useState(30)
  const [rate, setRate] = useState(8)
  const [term, setTerm] = useState(20)
  const [income, setIncome] = useState(50_000_000)

  const result = useMemo(() => {
    const downAmount = price * (downPct / 100)
    const loan = price - downAmount
    const monthlyRate = rate / 100 / 12
    const months = term * 12
    const monthly = monthlyRate > 0
      ? (loan * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
      : loan / months
    const totalPayment = monthly * months
    const totalInterest = totalPayment - loan

    return { downAmount, loan, monthly, totalPayment, totalInterest, debtRatio: income > 0 ? (monthly / income) * 100 : 0 }
  }, [price, downPct, rate, term, income])

  const pieData = [
    { name: "Trả trước", value: result.downAmount },
    { name: "Gốc vay", value: result.loan },
    { name: "Lãi suất", value: result.totalInterest },
  ]

  function applyPreset(p: typeof PRESETS[0]) {
    setDownPct(p.down)
    setRate(p.rate)
    setTerm(p.term)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Input */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-on-surface">Thông tin khoản vay</h3>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)}
              className="rounded-lg border border-outline-variant px-3 py-1.5 text-xs font-medium text-on-surface-variant hover:bg-surface-container">
              {p.label} ({p.down}%/{p.term} năm)
            </button>
          ))}
        </div>

        <InputSlider label="Giá bất động sản" value={price} onChange={setPrice} min={500e6} max={50e9} step={100e6} format={formatVND} />
        <InputSlider label="Trả trước (%)" value={downPct} onChange={setDownPct} min={10} max={70} step={5} format={(v) => `${v}%`} />
        <InputSlider label="Lãi suất (%/năm)" value={rate} onChange={setRate} min={4} max={15} step={0.5} format={(v) => `${v}%`} />
        <InputSlider label="Kỳ hạn (năm)" value={term} onChange={setTerm} min={5} max={30} step={1} format={(v) => `${v} năm`} />
        <InputSlider label="Thu nhập hàng tháng" value={income} onChange={setIncome} min={10e6} max={500e6} step={5e6} format={formatVND} />
      </div>

      {/* Results */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-on-surface">Kết quả tính toán</h3>

        <div className="grid grid-cols-2 gap-3">
          <ResultCard label="Trả góp hàng tháng" value={formatVND(result.monthly)} highlight />
          <ResultCard label="Tổng trả" value={formatVND(result.totalPayment)} />
          <ResultCard label="Tổng lãi" value={formatVND(result.totalInterest)} />
          <ResultCard label="Tỷ lệ nợ/thu nhập" value={`${result.debtRatio.toFixed(1)}%`}
            status={result.debtRatio <= 40 ? "good" : result.debtRatio <= 50 ? "warn" : "bad"} />
        </div>

        {/* Pie Chart */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-4">
          <p className="mb-2 text-sm font-semibold text-on-surface-variant">Cơ cấu chi phí</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip formatter={(value) => formatVND(Number(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-on-surface-variant">{d.name}: {formatVND(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InputSlider({ label, value, onChange, min, max, step, format }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; format: (v: number) => string
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-semibold text-on-surface">{format(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-container accent-primary" />
    </div>
  )
}

function ResultCard({ label, value, highlight, status }: {
  label: string; value: string; highlight?: boolean; status?: "good" | "warn" | "bad"
}) {
  const statusColor = status === "good" ? "text-secondary" : status === "warn" ? "text-amber-600" : status === "bad" ? "text-error" : "text-on-surface"
  return (
    <div className={`rounded-xl border p-3 ${highlight ? "border-primary bg-primary-container/30" : "border-outline-variant bg-surface-container-low"}`}>
      <p className="text-xs text-on-surface-variant">{label}</p>
      <p className={`text-lg font-bold ${highlight ? "text-primary" : statusColor}`}>{value}</p>
    </div>
  )
}
