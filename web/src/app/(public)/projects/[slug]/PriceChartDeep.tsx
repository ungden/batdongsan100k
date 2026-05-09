"use client";

import { useState, useMemo } from "react";
import { LineChart, Line, AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine, Legend } from "recharts";
import type { PricePoint } from "@/lib/queries/projects";

interface Props {
  history: PricePoint[];
  currentPricePerSqm: number;
  projectName: string;
}

const RANGES = [
  { value: "1m", label: "1M", days: 30 },
  { value: "6m", label: "6M", days: 180 },
  { value: "1y", label: "1Y", days: 365 },
  { value: "3y", label: "3Y", days: 365 * 3 },
  { value: "all", label: "Tất cả", days: 365 * 10 },
];

export default function PriceChartDeep({ history, currentPricePerSqm, projectName }: Props) {
  const [range, setRange] = useState("1y");

  const data = useMemo(() => {
    const days = RANGES.find((r) => r.value === range)?.days ?? 365;
    const cutoff = Date.now() - days * 86400_000;
    return history
      .filter((p) => new Date(p.date).getTime() >= cutoff)
      .map((p) => ({
        date: p.date.slice(5, 7) + "/" + p.date.slice(2, 4),
        price: Math.round((p.pricePerSqm / 1_000_000) * 10) / 10,
      }));
  }, [history, range]);

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-outline mb-2">show_chart</span>
        <p className="text-sm text-on-surface-variant">Chưa có lịch sử giá để hiển thị biểu đồ.</p>
      </div>
    );
  }

  const first = data[0]?.price;
  const last = data[data.length - 1]?.price;
  const delta = first && last ? ((last - first) / first) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">show_chart</span>
            Giá / m² theo thời gian
          </h3>
          <p className="text-xs text-on-surface-variant mt-0.5">{projectName} · giá thực tế từ snapshot daily</p>
        </div>
        <div className="flex gap-1 bg-surface-container-lowest rounded-xl p-1 border border-outline-variant/20">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                range === r.value ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-3xl font-black text-on-surface">{last?.toFixed(1)} <span className="text-base text-on-surface-variant">tr/m²</span></span>
        <span className={`text-sm font-bold ${delta > 0 ? "text-emerald-600" : delta < 0 ? "text-rose-500" : "text-on-surface-variant"}`}>
          {delta > 0 ? "+" : ""}{delta.toFixed(1)}% trong {RANGES.find(r => r.value === range)?.label}
        </span>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" fontSize={11} stroke="#94a3b8" />
            <YAxis fontSize={11} stroke="#94a3b8" tickFormatter={(v) => `${v}tr`} />
            <Tooltip formatter={(v) => [`${v} tr/m²`, "Giá"] as [string, string]} />
            <Area type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={2.5} fill="url(#priceArea)" dot={false} />
            {currentPricePerSqm > 0 && (
              <ReferenceLine
                y={Math.round((currentPricePerSqm / 1_000_000) * 10) / 10}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: "Hiện tại", fontSize: 10, fill: "#10b981", position: "right" }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
