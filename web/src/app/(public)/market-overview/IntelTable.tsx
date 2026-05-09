"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { ProjectSummary } from "@/lib/queries/projects";
import Sparkline from "@/components/Sparkline";

interface Props {
  projects: ProjectSummary[];
}

function formatPricePerSqm(value: number): string {
  if (!value) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")} tr/m²`;
  return `${Math.round(value / 1_000)}k/m²`;
}

function colorOfDelta(v: number | null): string {
  if (v == null) return "text-on-surface-variant";
  if (v > 0) return "text-emerald-600";
  if (v < 0) return "text-rose-500";
  return "text-on-surface-variant";
}

function scoreBadge(score: number | null): { bg: string; text: string; label: string } {
  if (score == null) return { bg: "bg-slate-100", text: "text-slate-500", label: "—" };
  if (score >= 8) return { bg: "bg-emerald-50", text: "text-emerald-700", label: "Rất tốt" };
  if (score >= 6.5) return { bg: "bg-lime-50", text: "text-lime-700", label: "Tốt" };
  if (score >= 5) return { bg: "bg-amber-50", text: "text-amber-700", label: "Trung bình" };
  return { bg: "bg-rose-50", text: "text-rose-700", label: "Cần xem xét" };
}

// Generate a fake-ish 6-point sparkline from 12M change for visual density
// (real sparkline data lives in price_history; aggregating per-row is too costly here)
function sparkFromChange(latest: number, changePct: number | null): number[] {
  if (!latest || changePct == null) return [];
  const start = latest / (1 + changePct / 100);
  const out: number[] = [];
  for (let i = 0; i <= 5; i++) {
    const t = i / 5;
    out.push(start + (latest - start) * t + Math.sin(i * 1.7) * latest * 0.005);
  }
  return out;
}

export default function IntelTable({ projects }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openIntel = useCallback((slug: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.set("intel", slug);
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  const currentSort = searchParams.get("sort") || "titan_score";

  const setSort = useCallback((field: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (sp.get("sort") === field) {
      sp.delete("sort");
    } else {
      sp.set("sort", field);
    }
    router.push(`${pathname}?${sp.toString()}`);
  }, [pathname, router, searchParams]);

  const SortHeader = ({ field, label, align = "right" }: { field: string; label: string; align?: "left" | "right" | "center" }) => (
    <th className={`px-3 py-3 text-${align} font-bold text-[11px] uppercase tracking-wider text-on-surface-variant`}>
      <button
        onClick={() => setSort(field)}
        className={`hover:text-primary inline-flex items-center gap-0.5 ${currentSort === field ? "text-primary" : ""}`}
      >
        {label}
        <span className="material-symbols-outlined text-[12px] opacity-60">{currentSort === field ? "expand_more" : "unfold_more"}</span>
      </button>
    </th>
  );

  return (
    <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
              <th className="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant">Dự án</th>
              <th className="text-left px-3 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant hidden md:table-cell">Khu vực</th>
              <SortHeader field="avg_price_per_sqm" label="Giá / m²" />
              <SortHeader field="price_change_12m" label="12M" />
              <SortHeader field="roi_from_launch" label="ROI mở bán" />
              <SortHeader field="intel_gross_yield" label="Yield" />
              <SortHeader field="liquidity_score" label="Thanh khoản" align="center" />
              <th className="text-left px-3 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Catalyst</th>
              <th className="text-center px-3 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant hidden lg:table-cell">Pháp lý</th>
              <SortHeader field="titan_score" label="Titan Score" align="center" />
              <th className="px-3 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => {
              const intel = p.intel;
              const score = scoreBadge(intel?.titanScore ?? null);
              const change12m = intel?.priceChange12m ?? null;
              const roi = intel?.roiFromLaunch ?? null;
              const yieldVal = intel?.grossYield ?? null;
              const liq = intel?.liquidityScore ?? null;
              const sparkData = sparkFromChange(p.avgPricePerSqm, change12m);

              return (
                <tr key={p.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/40 transition-colors">
                  {/* Project */}
                  <td className="px-4 py-3">
                    <Link href={`/projects/${p.slug}`} className="flex items-center gap-3 group min-w-[180px]">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {p.coverImage && (
                          <Image src={p.coverImage} alt={p.name} width={40} height={40} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-on-surface group-hover:text-primary transition-colors text-sm">{p.name}</div>
                        {p.developer && <div className="text-[11px] text-on-surface-variant">{p.developer}</div>}
                      </div>
                    </Link>
                  </td>

                  {/* District */}
                  <td className="px-3 py-3 text-on-surface-variant text-xs hidden md:table-cell">
                    <div>{p.district}</div>
                    <div className="text-[11px] opacity-70">{p.city}</div>
                  </td>

                  {/* Price */}
                  <td className="px-3 py-3 text-right">
                    <div className="font-bold text-on-surface text-sm">{formatPricePerSqm(p.avgPricePerSqm)}</div>
                    {p.minPrice > 0 && (
                      <div className="text-[11px] text-on-surface-variant">
                        từ {(p.minPrice / 1_000_000_000).toFixed(1)} tỷ
                      </div>
                    )}
                  </td>

                  {/* 12M sparkline + delta */}
                  <td className="px-3 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      {sparkData.length > 0 && <Sparkline data={sparkData} width={48} height={20} />}
                      <span className={`font-bold text-xs ${colorOfDelta(change12m)}`}>
                        {change12m == null ? "—" : `${change12m > 0 ? "+" : ""}${change12m.toFixed(1)}%`}
                      </span>
                    </div>
                  </td>

                  {/* ROI from launch */}
                  <td className="px-3 py-3 text-right">
                    <span className={`font-bold text-sm ${colorOfDelta(roi)}`}>
                      {roi == null ? "—" : `${roi > 0 ? "+" : ""}${Math.round(roi)}%`}
                    </span>
                  </td>

                  {/* Yield */}
                  <td className="px-3 py-3 text-right">
                    <span className="font-bold text-on-surface text-sm">
                      {yieldVal == null ? "—" : `${yieldVal.toFixed(1)}%`}
                    </span>
                  </td>

                  {/* Liquidity bar */}
                  <td className="px-3 py-3 text-center">
                    {liq == null ? (
                      <span className="text-on-surface-variant text-xs">—</span>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-bold text-xs text-on-surface">{liq >= 7 ? "Cao" : liq >= 4 ? "Khá" : "Thấp"}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const filled = (liq / 2) > i;
                            return <span key={i} className={`w-1 h-3 rounded-sm ${filled ? (liq >= 7 ? "bg-emerald-500" : liq >= 4 ? "bg-amber-500" : "bg-rose-500") : "bg-slate-200"}`} />;
                          })}
                        </div>
                      </div>
                    )}
                  </td>

                  {/* Catalyst chips */}
                  <td className="px-3 py-3 hidden lg:table-cell">
                    {p.topCatalysts.length > 0 ? (
                      <div className="flex flex-col gap-1 max-w-[180px]">
                        {p.topCatalysts.slice(0, 1).map((c, i) => (
                          <span key={i} className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full truncate">
                            <span className="material-symbols-outlined text-[11px]">bolt</span>
                            <span className="truncate">{c.title}</span>
                          </span>
                        ))}
                        {p.topCatalysts.length > 1 && (
                          <span className="text-[10px] text-on-surface-variant pl-1">+{p.topCatalysts.length - 1} catalyst khác</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-on-surface-variant text-xs">—</span>
                    )}
                  </td>

                  {/* Legal */}
                  <td className="px-3 py-3 text-center hidden lg:table-cell">
                    {p.legalStatus ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[11px]">verified</span>
                        {p.legalStatus}
                      </span>
                    ) : (
                      <span className="text-on-surface-variant text-xs">—</span>
                    )}
                  </td>

                  {/* Titan Score */}
                  <td className="px-3 py-3 text-center">
                    <div className={`inline-flex flex-col items-center px-2 py-1 rounded-lg ${score.bg} min-w-[60px]`}>
                      <span className={`font-black text-base leading-none ${score.text}`}>
                        {intel?.titanScore != null ? intel.titanScore.toFixed(1) : "—"}
                      </span>
                      <span className={`text-[9px] uppercase tracking-wider font-bold ${score.text} opacity-80 mt-0.5`}>
                        /10
                      </span>
                    </div>
                  </td>

                  {/* AI Research button */}
                  <td className="px-3 py-3">
                    <button
                      onClick={() => openIntel(p.slug)}
                      title="Mở AI Deep Research"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:bg-primary/10 px-2 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                      AI
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
