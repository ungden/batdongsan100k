"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const PURPOSES = [
  { value: "", label: "Tất cả mục đích", icon: "all_inclusive" },
  { value: "living", label: "Để ở thật", icon: "home" },
  { value: "rental", label: "Cho thuê", icon: "key" },
  { value: "investment", label: "Đầu tư dài hạn", icon: "savings" },
  { value: "flip", label: "Lướt sóng", icon: "trending_up" },
];

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "selling", label: "Đang bán" },
  { value: "secondary", label: "Thứ cấp" },
  { value: "upcoming", label: "Sắp mở bán" },
];

const LEGAL_OPTIONS = [
  { value: "", label: "Mọi pháp lý" },
  { value: "so_hong", label: "Sổ hồng" },
  { value: "hdmb", label: "HĐMB" },
];

export default function MarketFilters({ projectCount }: { projectCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localQ, setLocalQ] = useState(searchParams.get("q") || "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const currentPurpose = searchParams.get("purpose") || "";
  const currentStatus = searchParams.get("status") || "";
  const currentLegal = searchParams.get("legal") || "";
  const currentMinYield = searchParams.get("minYield") || "";
  const currentMinRoi = searchParams.get("minRoi") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const updateQuery = useCallback(
    (updates: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) sp.set(k, v);
        else sp.delete(k);
      });
      // When changing filters, drop the panel
      sp.delete("intel");
      router.push(`${pathname}?${sp.toString()}`);
    },
    [searchParams, pathname, router]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (localQ !== currentQ) updateQuery({ q: localQ });
    }, 400);
    return () => clearTimeout(timer);
  }, [localQ, searchParams, updateQuery]);

  const activeFilterCount = [currentLegal, currentMinYield, currentMinRoi, currentMaxPrice].filter(Boolean).length;

  return (
    <div className="mb-4 space-y-3">
      {/* Row 1: Purpose chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mr-1">Tôi muốn:</span>
        {PURPOSES.map((p) => (
          <button
            key={p.value}
            onClick={() => updateQuery({ purpose: p.value })}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
              currentPurpose === p.value
                ? "bg-primary text-white border-primary shadow-sm"
                : "bg-white text-on-surface-variant border-outline-variant/30 hover:border-primary/40 hover:text-primary"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>

      {/* Row 2: Search + Status + More toggle */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 flex-1 w-full">
          <div className="relative w-full sm:w-72">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
            <input
              type="text"
              value={localQ}
              onChange={(e) => setLocalQ(e.target.value)}
              placeholder="Tìm dự án, khu vực, chủ đầu tư..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </div>

          <div className="flex gap-1 bg-surface-container-lowest rounded-xl p-1 border border-outline-variant/20">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => updateQuery({ status: tab.value })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentStatus === tab.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAdvanced((v) => !v)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
              showAdvanced || activeFilterCount > 0
                ? "bg-primary/10 text-primary border-primary/30"
                : "bg-white border-outline-variant/30 text-on-surface-variant hover:border-primary/40"
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">tune</span>
            Bộ lọc khác
            {activeFilterCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold px-1.5 rounded-full min-w-[18px] text-center">{activeFilterCount}</span>
            )}
          </button>
        </div>

        <span className="text-xs text-on-surface-variant">
          <strong className="text-on-surface">{projectCount}</strong> dự án
        </span>
      </div>

      {/* Advanced panel */}
      {showAdvanced && (
        <div className="bg-white rounded-2xl border border-outline-variant/30 p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Pháp lý</label>
            <select
              value={currentLegal}
              onChange={(e) => updateQuery({ legal: e.target.value })}
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
            >
              {LEGAL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Yield tối thiểu (%/năm)</label>
            <input
              type="number"
              value={currentMinYield}
              onChange={(e) => updateQuery({ minYield: e.target.value })}
              placeholder="ví dụ 4.5"
              step="0.5"
              min="0"
              max="10"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">ROI mở bán tối thiểu (%)</label>
            <input
              type="number"
              value={currentMinRoi}
              onChange={(e) => updateQuery({ minRoi: e.target.value })}
              placeholder="ví dụ 30"
              step="10"
              min="0"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-1.5">Ngân sách tối đa (tỷ)</label>
            <input
              type="number"
              value={currentMaxPrice}
              onChange={(e) => updateQuery({ maxPrice: e.target.value })}
              placeholder="ví dụ 5"
              step="0.5"
              min="0"
              className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
