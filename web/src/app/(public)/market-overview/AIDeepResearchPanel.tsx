"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import type { ProjectDeepIntel } from "@/lib/queries/projects";

interface Props {
  data: ProjectDeepIntel;
}

const TABS = [
  { value: "overview", label: "Tổng quan" },
  { value: "price", label: "Giá" },
  { value: "rental", label: "Cho thuê" },
  { value: "catalyst", label: "Catalyst" },
  { value: "risk", label: "Rủi ro" },
  { value: "chat", label: "AI Chat" },
];

function formatPriceK(value: number): string {
  if (!value) return "—";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} tr`;
  return `${Math.round(value / 1_000)}k`;
}

function scoreColor(score: number | null): string {
  if (score == null) return "text-slate-500 bg-slate-100";
  if (score >= 8) return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (score >= 6.5) return "text-lime-700 bg-lime-50 border-lime-200";
  if (score >= 5) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

function scoreLabel(score: number | null): string {
  if (score == null) return "—";
  if (score >= 8) return "Rất tốt";
  if (score >= 6.5) return "Tốt";
  if (score >= 5) return "Trung bình";
  return "Cần xem xét";
}

export default function AIDeepResearchPanel({ data }: Props) {
  const { project, catalysts, priceHistory, nearby } = data;
  const intel = project.intel;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("overview");

  const close = useCallback(() => {
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("intel");
    router.push(`${pathname}?${sp.toString()}`, { scroll: false });
  }, [pathname, router, searchParams]);

  // ESC key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // Lock body scroll while panel is open (mobile esp.)
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = original; };
  }, []);

  const titan = intel?.titanScore ?? null;
  const colorClass = scoreColor(titan);

  const chartData = priceHistory.map((p) => ({
    date: p.date.slice(5, 7) + "/" + p.date.slice(2, 4),
    price: Math.round(p.pricePerSqm / 1_000_000 * 10) / 10,
  }));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />

      {/* Slide-in panel */}
      <aside
        role="dialog"
        aria-label="AI Deep Research"
        className="fixed top-0 right-0 z-50 h-full w-full sm:w-[480px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-outline-variant/20 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-1">
              <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
              AI Deep Research Report
            </div>
            <h2 className="text-xl font-black text-on-surface truncate">{project.name}</h2>
            <div className="text-xs text-on-surface-variant mt-0.5">{project.district}, {project.city}</div>
          </div>
          <div className="flex items-center gap-2 ml-3">
            <div className={`flex flex-col items-center px-2.5 py-1 rounded-xl border ${colorClass}`}>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Titan Score</span>
              <span className="font-black text-2xl leading-none">{titan != null ? titan.toFixed(1) : "—"}</span>
              <span className="text-[10px] font-bold opacity-70">{scoreLabel(titan)}</span>
            </div>
            <button
              onClick={close}
              className="p-1.5 rounded-full hover:bg-surface-container-lowest text-on-surface-variant"
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 px-5 border-b border-outline-variant/20 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-2 text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${
                tab === t.value
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {tab === "overview" && (
            <>
              {/* AI summary */}
              <div className="bg-surface-container-lowest rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                  Tóm tắt bởi AI
                </div>
                <ul className="space-y-1.5 text-sm">
                  {intel?.roiFromLaunch != null && (
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[14px] mt-0.5">trending_up</span>
                      <span><strong>ROI từ mở bán:</strong> <span className="text-emerald-600 font-bold">{intel.roiFromLaunch > 0 ? "+" : ""}{Math.round(intel.roiFromLaunch)}%</span></span>
                    </li>
                  )}
                  {intel?.grossYield != null && (
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[14px] mt-0.5">key</span>
                      <span><strong>Yield cho thuê:</strong> {intel.grossYield.toFixed(1)}%/năm</span>
                    </li>
                  )}
                  {catalysts.length > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-indigo-600 text-[14px] mt-0.5">bolt</span>
                      <span><strong>Catalyst chính:</strong> {catalysts.filter(c => c.impact === 'high').slice(0, 2).map(c => c.title).join(', ') || catalysts[0].title}</span>
                    </li>
                  )}
                  {intel?.riskTags && intel.riskTags.length > 0 && (
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-rose-500 text-[14px] mt-0.5">warning</span>
                      <span><strong>Rủi ro:</strong> {intel.riskTags.join(', ')}</span>
                    </li>
                  )}
                </ul>
              </div>

              {/* Strengths */}
              {intel?.strengths && intel.strengths.length > 0 && (
                <Section icon="check_circle" iconColor="text-emerald-600" title="Điểm mạnh">
                  <ul className="space-y-1 text-sm text-on-surface">
                    {intel.strengths.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </Section>
              )}

              {/* Weaknesses */}
              {intel?.weaknesses && intel.weaknesses.length > 0 && (
                <Section icon="info" iconColor="text-amber-600" title="Điểm yếu">
                  <ul className="space-y-1 text-sm text-on-surface">
                    {intel.weaknesses.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </Section>
              )}

              {/* Compare */}
              {nearby.length > 0 && (
                <Section icon="compare_arrows" iconColor="text-indigo-600" title="So sánh nhanh cùng khu">
                  <div className="space-y-1.5">
                    {nearby.map((n) => (
                      <Link key={n.slug} href={`/market-overview?intel=${n.slug}`} className="flex items-center justify-between text-sm hover:bg-surface-container-lowest -mx-2 px-2 py-1 rounded-lg">
                        <span className="text-on-surface truncate">{n.name}</span>
                        <span className="flex items-center gap-2">
                          <span className="text-[11px] text-on-surface-variant">{formatPriceK(n.avgPricePerSqm)}/m²</span>
                          {n.titanScore != null && <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${scoreColor(n.titanScore).split(' ').slice(0, 2).join(' ')}`}>{n.titanScore.toFixed(1)}</span>}
                        </span>
                      </Link>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}

          {tab === "price" && (
            <>
              {chartData.length >= 2 ? (
                <Section icon="show_chart" iconColor="text-primary" title="Giá / m² theo thời gian">
                  <div className="h-48 -mx-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <XAxis dataKey="date" fontSize={10} stroke="#94a3b8" />
                        <YAxis fontSize={10} stroke="#94a3b8" tickFormatter={(v) => `${v}tr`} />
                        <Tooltip formatter={(v: number) => [`${v} tr/m²`, "Giá"]} />
                        <Line type="monotone" dataKey="price" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Section>
              ) : (
                <p className="text-sm text-on-surface-variant">Chưa đủ dữ liệu lịch sử giá để hiển thị biểu đồ.</p>
              )}

              <div className="grid grid-cols-3 gap-3">
                <KPI label="1 tháng" value={fmtPct(intel?.priceChange1m)} color={colorPct(intel?.priceChange1m)} />
                <KPI label="6 tháng" value={fmtPct(intel?.priceChange6m)} color={colorPct(intel?.priceChange6m)} />
                <KPI label="12 tháng" value={fmtPct(intel?.priceChange12m)} color={colorPct(intel?.priceChange12m)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <KPI label="ROI mở bán" value={fmtPct(intel?.roiFromLaunch)} color={colorPct(intel?.roiFromLaunch)} />
                <KPI label="CAGR" value={intel?.cagrSinceLaunch != null ? `${intel.cagrSinceLaunch.toFixed(1)}%/năm` : "—"} />
              </div>
            </>
          )}

          {tab === "rental" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <KPI label="Gross yield" value={intel?.grossYield != null ? `${intel.grossYield.toFixed(1)}%` : "—"} />
                <KPI label="Net yield" value={intel?.netYield != null ? `${intel.netYield.toFixed(1)}%` : "—"} />
                <KPI label="Tin bán đang rao" value={String(intel?.activeSaleListings ?? 0)} />
                <KPI label="Tin cho thuê" value={String(intel?.activeRentListings ?? 0)} />
              </div>
              <p className="text-xs text-on-surface-variant">
                Net yield ước lượng = Gross yield × 0.75 (sau phí quản lý, trống phòng, bảo trì).
              </p>
            </>
          )}

          {tab === "catalyst" && (
            <>
              {catalysts.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Chưa có catalyst nào được ghi nhận.</p>
              ) : (
                <div className="space-y-3">
                  {catalysts.map((c) => (
                    <div key={c.id} className="flex gap-3">
                      <div className={`w-10 shrink-0 text-[11px] font-bold text-center pt-1 ${
                        c.impact === 'high' ? 'text-indigo-600' : c.impact === 'medium' ? 'text-amber-600' : 'text-on-surface-variant'
                      }`}>
                        {c.expectedDate ? c.expectedDate.slice(0, 4) : "—"}
                      </div>
                      <div className="flex-1 border-l-2 border-outline-variant/20 pl-3 pb-2">
                        <div className="font-bold text-sm text-on-surface">{c.title}</div>
                        {c.description && <div className="text-xs text-on-surface-variant mt-0.5">{c.description}</div>}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <Tag color="indigo">{c.category}</Tag>
                          <Tag color={c.impact === 'high' ? 'rose' : c.impact === 'medium' ? 'amber' : 'slate'}>{c.impact}</Tag>
                          <Tag color="slate">{c.horizon === 'short' ? '0–12m' : c.horizon === 'medium' ? '1–3y' : '3–5y'}</Tag>
                          {c.status !== 'confirmed' && <Tag color="amber">{c.status}</Tag>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "risk" && (
            <>
              <KPI label="Risk Score" value={intel?.riskScore != null ? `${intel.riskScore.toFixed(1)} / 10` : "—"} color={intel?.riskScore != null && intel.riskScore > 6 ? 'text-rose-600' : 'text-on-surface'} />
              {intel?.riskTags && intel.riskTags.length > 0 && (
                <Section icon="warning" iconColor="text-amber-600" title="Rủi ro phát hiện">
                  <div className="flex flex-wrap gap-1.5">
                    {intel.riskTags.map((t) => <Tag key={t} color="rose">{t}</Tag>)}
                  </div>
                </Section>
              )}
              {intel?.risks && intel.risks.length > 0 && (
                <Section icon="info" iconColor="text-rose-600" title="Lưu ý">
                  <ul className="space-y-1 text-sm text-on-surface">
                    {intel.risks.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </Section>
              )}
            </>
          )}

          {tab === "chat" && (
            <div className="space-y-3">
              <div className="bg-surface-container-lowest rounded-xl p-4 text-sm text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px] align-middle mr-1">construction</span>
                AI Chat đang phát triển. Tạm thời bạn có thể xem các câu hỏi gợi ý:
              </div>
              <div className="space-y-2">
                {[
                  "Dự án này có đáng mua không?",
                  "Giá hiện tại có cao không?",
                  "Loại căn nào dễ cho thuê nhất?",
                  "So với dự án gần đó thì sao?",
                ].map((q) => (
                  <button key={q} className="w-full text-left bg-white border border-outline-variant/30 hover:border-primary/40 rounded-xl px-3 py-2 text-sm text-on-surface">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="border-t border-outline-variant/20 p-4 bg-surface-container-lowest">
          <Link
            href={`/projects/${project.slug}`}
            className="block w-full text-center bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            <span className="material-symbols-outlined text-[16px] align-middle mr-1">open_in_new</span>
            Mở full report
          </Link>
        </div>
      </aside>
    </>
  );
}

// ============================================================
// Subcomponents
// ============================================================

function Section({ icon, iconColor, title, children }: { icon: string; iconColor: string; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={`material-symbols-outlined text-[16px] ${iconColor}`}>{icon}</span>
        <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function KPI({ label, value, color = "text-on-surface" }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-white border border-outline-variant/20 rounded-xl p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</div>
      <div className={`text-lg font-black mt-0.5 ${color}`}>{value}</div>
    </div>
  );
}

function Tag({ color, children }: { color: 'indigo' | 'rose' | 'amber' | 'slate' | 'emerald'; children: React.ReactNode }) {
  const map = {
    indigo: 'bg-indigo-50 text-indigo-700',
    rose: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-700',
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
  } as const;
  return <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${map[color]}`}>{children}</span>;
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v > 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function colorPct(v: number | null | undefined): string {
  if (v == null) return "text-on-surface";
  if (v > 0) return "text-emerald-600";
  if (v < 0) return "text-rose-500";
  return "text-on-surface";
}
