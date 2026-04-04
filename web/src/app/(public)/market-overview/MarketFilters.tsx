"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

const STATUS_TABS = [
  { value: "", label: "Tất cả" },
  { value: "selling", label: "Đang bán" },
  { value: "secondary", label: "Thứ cấp" },
  { value: "upcoming", label: "Sắp mở bán" },
];

export default function MarketFilters({ projectCount }: { projectCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localQ, setLocalQ] = useState(searchParams.get("q") || "");

  const currentStatus = searchParams.get("status") || "";
  const currentView = searchParams.get("view") || "grid";

  const updateQuery = useCallback(
    (updates: Record<string, string>) => {
      const sp = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([k, v]) => {
        if (v) sp.set(k, v);
        else sp.delete(k);
      });
      router.push(`${pathname}?${sp.toString()}`);
    },
    [searchParams, pathname, router]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentQ = searchParams.get("q") || "";
      if (localQ !== currentQ) updateQuery({ q: localQ });
    }, 400);
    return () => clearTimeout(timer);
  }, [localQ, searchParams, updateQuery]);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
      {/* Left: Search + Status tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1 w-full md:w-auto">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            type="text"
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            placeholder="Tìm dự án, khu vực..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant/30 rounded-xl text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
        </div>

        {/* Status tabs */}
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
      </div>

      {/* Right: Count + View toggle */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-on-surface-variant">
          <strong className="text-on-surface">{projectCount}</strong> dự án
        </span>
        <div className="flex bg-surface-container-lowest rounded-lg p-0.5 border border-outline-variant/20">
          <button
            onClick={() => updateQuery({ view: "grid" })}
            className={`p-1.5 rounded-md transition-all ${
              currentView === "grid" ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
            title="Dạng lưới"
          >
            <span className="material-symbols-outlined text-lg">grid_view</span>
          </button>
          <button
            onClick={() => updateQuery({ view: "table" })}
            className={`p-1.5 rounded-md transition-all ${
              currentView === "table" ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low"
            }`}
            title="Dạng bảng"
          >
            <span className="material-symbols-outlined text-lg">view_list</span>
          </button>
        </div>
      </div>
    </div>
  );
}
