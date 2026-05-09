export const revalidate = 600;

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { ProjectSummary } from "@/lib/queries/projects";

export const metadata: Metadata = {
  title: "So sánh dự án | Market Intelligence",
  description: "So sánh dự án theo Titan Score, ROI, yield, thanh khoản, catalyst và pháp lý.",
};

interface PageProps {
  searchParams: Promise<{ slugs?: string }>;
}

// Inline mapper (lightweight subset)
function mapRow(row: any): ProjectSummary {
  return {
    id: row.id, name: row.name, slug: row.slug,
    developer: row.developer, city: row.city || '', district: row.district || '',
    description: row.description, coverImage: row.cover_image, propertyCount: row.property_count || 0,
    minPrice: Number(row.min_price || 0), maxPrice: Number(row.max_price || 0), avgPrice: Number(row.avg_price || 0),
    avgPricePerSqm: Number(row.avg_price_per_sqm || 0), avgArea: Number(row.avg_area || 0),
    status: row.status || 'selling', amenities: row.amenities || [],
    priceRange: row.price_range, completionDate: row.completion_date,
    legalStatus: row.legal_status, handoverStandard: row.handover_standard,
    totalUnits: row.total_units, soldUnits: row.sold_units, floors: row.floors, blocks: row.blocks,
    apartmentTypes: row.apartment_types || [], totalAreaHa: row.total_area_ha ? Number(row.total_area_ha) : null,
    rentalYield: row.rental_yield ? Number(row.rental_yield) : null, badges: row.badges || [],
    intel: row.titan_score == null ? null : {
      roiFromLaunch: row.roi_from_launch == null ? null : Number(row.roi_from_launch),
      cagrSinceLaunch: row.cagr_since_launch == null ? null : Number(row.cagr_since_launch),
      priceChange1m: row.price_change_1m == null ? null : Number(row.price_change_1m),
      priceChange6m: row.price_change_6m == null ? null : Number(row.price_change_6m),
      priceChange12m: row.price_change_12m == null ? null : Number(row.price_change_12m),
      grossYield: row.intel_gross_yield == null ? null : Number(row.intel_gross_yield),
      netYield: row.net_yield == null ? null : Number(row.net_yield),
      activeSaleListings: row.active_sale_listings || 0,
      activeRentListings: row.active_rent_listings || 0,
      liquidityScore: row.liquidity_score == null ? null : Number(row.liquidity_score),
      riskScore: row.risk_score == null ? null : Number(row.risk_score),
      riskTags: row.risk_tags || [],
      strengths: row.strengths || [], weaknesses: row.weaknesses || [], risks: row.risks || [],
      titanScore: row.titan_score == null ? null : Number(row.titan_score),
      livingScore: row.living_score == null ? null : Number(row.living_score),
      investmentScore: row.investment_score == null ? null : Number(row.investment_score),
      rentalScore: row.rental_score == null ? null : Number(row.rental_score),
    },
    topCatalysts: [],
  };
}

function fmtPct(v: number | null | undefined): string {
  if (v == null) return "—";
  return `${v > 0 ? "+" : ""}${typeof v === 'number' && Math.abs(v) >= 10 ? Math.round(v) : v.toFixed(1)}%`;
}

function fmtPricePerSqm(v: number | null | undefined): string {
  if (!v) return "—";
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)} tr`;
  return `${Math.round(v / 1_000)}k`;
}

export default async function CompareProjectsPage({ searchParams }: PageProps) {
  const { slugs } = await searchParams;
  const slugList = (slugs || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 4);

  let projects: ProjectSummary[] = [];
  let allProjects: { name: string; slug: string }[] = [];

  if (slugList.length > 0) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("v_projects_with_intel")
      .select("*")
      .in("slug", slugList);
    projects = (data || []).map(mapRow);
    // Preserve order from URL
    projects.sort((a, b) => slugList.indexOf(a.slug) - slugList.indexOf(b.slug));
  }

  // Picker dropdown options
  {
    const supabase = await createClient();
    const { data } = await supabase.from("projects").select("name, slug").order("property_count", { ascending: false }).limit(60);
    allProjects = (data || []) as any[];
  }

  // Compare rows: each gives a label + render fn + winner picker
  type Row = { label: string; render: (p: ProjectSummary) => string; winner?: 'max' | 'min' | 'specific'; pick?: (p: ProjectSummary) => number | null };
  const rows: Row[] = [
    { label: "Khu vực", render: (p) => `${p.district}, ${p.city}` },
    { label: "Chủ đầu tư", render: (p) => p.developer || "—" },
    { label: "Pháp lý", render: (p) => p.legalStatus || "—", winner: 'specific', pick: (p) => p.legalStatus?.toLowerCase().includes("sổ hồng") ? 1 : 0 },
    { label: "Quy mô", render: (p) => p.totalUnits ? `${p.totalUnits.toLocaleString("vi-VN")} căn` : "—" },
    { label: "Giá hiện tại / m²", render: (p) => fmtPricePerSqm(p.avgPricePerSqm), winner: 'min', pick: (p) => p.avgPricePerSqm || null },
    { label: "ROI từ mở bán", render: (p) => fmtPct(p.intel?.roiFromLaunch), winner: 'max', pick: (p) => p.intel?.roiFromLaunch ?? null },
    { label: "Tăng giá 12M", render: (p) => fmtPct(p.intel?.priceChange12m), winner: 'max', pick: (p) => p.intel?.priceChange12m ?? null },
    { label: "Yield gross", render: (p) => p.intel?.grossYield != null ? `${p.intel.grossYield.toFixed(1)}%` : "—", winner: 'max', pick: (p) => p.intel?.grossYield ?? null },
    { label: "Yield net", render: (p) => p.intel?.netYield != null ? `${p.intel.netYield.toFixed(1)}%` : "—", winner: 'max', pick: (p) => p.intel?.netYield ?? null },
    { label: "Thanh khoản", render: (p) => p.intel?.liquidityScore != null ? `${p.intel.liquidityScore.toFixed(1)}/10` : "—", winner: 'max', pick: (p) => p.intel?.liquidityScore ?? null },
    { label: "Risk Score", render: (p) => p.intel?.riskScore != null ? `${p.intel.riskScore.toFixed(1)}/10` : "—", winner: 'min', pick: (p) => p.intel?.riskScore ?? null },
    { label: "Tin bán đang rao", render: (p) => String(p.intel?.activeSaleListings ?? 0) },
    { label: "Tin cho thuê", render: (p) => String(p.intel?.activeRentListings ?? 0) },
    { label: "Titan Score", render: (p) => p.intel?.titanScore != null ? `${p.intel.titanScore.toFixed(1)}/10` : "—", winner: 'max', pick: (p) => p.intel?.titanScore ?? null },
    { label: "Investment Score", render: (p) => p.intel?.investmentScore != null ? `${p.intel.investmentScore.toFixed(1)}/10` : "—", winner: 'max', pick: (p) => p.intel?.investmentScore ?? null },
    { label: "Rental Score", render: (p) => p.intel?.rentalScore != null ? `${p.intel.rentalScore.toFixed(1)}/10` : "—", winner: 'max', pick: (p) => p.intel?.rentalScore ?? null },
    { label: "Living Score", render: (p) => p.intel?.livingScore != null ? `${p.intel.livingScore.toFixed(1)}/10` : "—", winner: 'max', pick: (p) => p.intel?.livingScore ?? null },
  ];

  // Winner per row
  function winnerSlug(row: Row): string | null {
    if (!row.winner || !row.pick) return null;
    const valued = projects
      .map((p) => ({ slug: p.slug, val: row.pick!(p) }))
      .filter((x) => x.val != null) as { slug: string; val: number }[];
    if (valued.length === 0) return null;
    const best = valued.reduce((a, b) => row.winner === 'max' ? (a.val > b.val ? a : b) : (a.val < b.val ? a : b));
    return best.slug;
  }

  // Conclusion: best-of by use case
  function conclude(scoreKey: keyof NonNullable<ProjectSummary["intel"]>) {
    const valued = projects
      .map((p) => ({ name: p.name, slug: p.slug, val: (p.intel?.[scoreKey] as number | null) ?? null }))
      .filter((x) => x.val != null) as { name: string; slug: string; val: number }[];
    if (valued.length === 0) return null;
    return valued.reduce((a, b) => a.val > b.val ? a : b);
  }

  const livingPick = conclude("livingScore");
  const investmentPick = conclude("investmentScore");
  const rentalPick = conclude("rentalScore");
  const flipPick = conclude("liquidityScore");

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant mb-2">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/market-overview" className="hover:text-primary">Market Intelligence</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-bold">So sánh dự án</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-on-surface tracking-tight">So sánh dự án</h1>
        <p className="text-sm text-on-surface-variant mt-1">Tối đa 4 dự án theo 17 chỉ số. Chọn từ dropdown hoặc thêm `?slugs=a,b,c` vào URL.</p>
      </section>

      {/* Slug picker */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <ProjectPicker current={slugList} options={allProjects} />
      </section>

      {projects.length === 0 ? (
        <section className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-10 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">compare_arrows</span>
            <p className="text-lg font-bold text-on-surface mb-2">Chưa chọn dự án</p>
            <p className="text-on-surface-variant">Dùng dropdown phía trên để chọn 2–4 dự án so sánh.</p>
          </div>
        </section>
      ) : (
        <>
          {/* Compare table */}
          <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
            <div className="bg-white rounded-2xl border border-outline-variant/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
                      <th className="text-left px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant w-44">Chỉ số</th>
                      {projects.map((p) => (
                        <th key={p.id} className="px-4 py-3">
                          <Link href={`/projects/${p.slug}`} className="block group">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                {p.coverImage && <Image src={p.coverImage} alt={p.name} width={40} height={40} className="object-cover w-full h-full" />}
                              </div>
                              <div className="text-left">
                                <div className="font-bold text-on-surface text-sm group-hover:text-primary truncate max-w-[140px]">{p.name}</div>
                                <div className="text-[11px] text-on-surface-variant">{p.district}</div>
                              </div>
                            </div>
                          </Link>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => {
                      const w = winnerSlug(row);
                      return (
                        <tr key={row.label} className={i % 2 === 0 ? "bg-white" : "bg-surface-container-lowest/30"}>
                          <td className="px-4 py-3 font-bold text-[11px] uppercase tracking-wider text-on-surface-variant">{row.label}</td>
                          {projects.map((p) => (
                            <td key={p.id} className="px-4 py-3">
                              <span className={`text-sm ${w === p.slug ? "font-black text-emerald-600" : "text-on-surface"}`}>
                                {w === p.slug && <span className="mr-1">🏆</span>}
                                {row.render(p)}
                              </span>
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Conclusion cards */}
          {projects.length >= 2 && (
            <section className="max-w-7xl mx-auto px-4 md:px-8">
              <h2 className="text-lg font-bold text-on-surface mb-3">Kết luận theo mục đích</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <ConclusionCard icon="home" color="emerald" title="Để ở thật" pick={livingPick} />
                <ConclusionCard icon="trending_up" color="indigo" title="Đầu tư dài hạn" pick={investmentPick} />
                <ConclusionCard icon="key" color="amber" title="Cho thuê" pick={rentalPick} />
                <ConclusionCard icon="bolt" color="rose" title="Lướt sóng / thanh khoản" pick={flipPick} />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function ConclusionCard({ icon, color, title, pick }: { icon: string; color: 'emerald' | 'indigo' | 'amber' | 'rose'; title: string; pick: { name: string; slug: string; val: number } | null }) {
  const map = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
  } as const;
  return (
    <div className={`rounded-2xl border p-4 ${map[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="material-symbols-outlined">{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider opacity-80">{title}</span>
      </div>
      {pick ? (
        <Link href={`/projects/${pick.slug}`} className="block">
          <div className="font-black text-base">{pick.name}</div>
          <div className="text-xs opacity-70 mt-0.5">Score {pick.val.toFixed(1)}/10</div>
        </Link>
      ) : (
        <div className="text-sm opacity-70">Chưa đủ dữ liệu</div>
      )}
    </div>
  );
}

function ProjectPicker({ current, options }: { current: string[]; options: { name: string; slug: string }[] }) {
  return (
    <details className="bg-white rounded-2xl border border-outline-variant/30 p-4">
      <summary className="cursor-pointer font-bold text-sm text-on-surface flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">add_circle</span>
        Chọn dự án để so sánh
        {current.length > 0 && <span className="text-xs text-on-surface-variant ml-auto font-normal">{current.length}/4</span>}
      </summary>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {options.map((o) => {
          const isCurrent = current.includes(o.slug);
          const next = isCurrent
            ? current.filter((s) => s !== o.slug)
            : current.length < 4 ? [...current, o.slug] : current;
          const href = next.length > 0 ? `/compare/projects?slugs=${next.join(",")}` : "/compare/projects";
          return (
            <Link
              key={o.slug}
              href={href}
              className={`text-xs px-2.5 py-1.5 rounded-lg text-center transition-colors ${
                isCurrent
                  ? "bg-primary text-white font-bold"
                  : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
              }`}
            >
              {o.name}
            </Link>
          );
        })}
      </div>
    </details>
  );
}
