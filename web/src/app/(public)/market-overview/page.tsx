export const revalidate = 600; // ISR 10 phút

import Link from "next/link";
import type { Metadata } from "next";
import { getProjects, getMarketKPIs, getProjectDeepIntel } from "@/lib/queries/projects";
import MarketFilters from "./MarketFilters";
import Sparkline from "@/components/Sparkline";
import IntelTable from "./IntelTable";
import AIDeepResearchPanel from "./AIDeepResearchPanel";

export const metadata: Metadata = {
  title: "Market Intelligence | TitanHome",
  description: "Phân tích giá, ROI, lợi suất cho thuê, catalyst và Titan Score cho các dự án bất động sản tại Việt Nam.",
};

function formatPricePerSqm(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")} tr/m²`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k/m²`;
  return `${Math.round(value)}/m²`;
}

interface PageProps {
  searchParams: Promise<{
    q?: string; status?: string; city?: string; sort?: string; view?: string;
    purpose?: string; legal?: string; minYield?: string; minRoi?: string;
    minLiquidity?: string; maxPrice?: string;
    intel?: string;
  }>;
}

export default async function MarketOverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters = {
    search: params.q,
    status: params.status,
    city: params.city,
    legal: params.legal,
    minYield: params.minYield ? Number(params.minYield) : undefined,
    minRoi: params.minRoi ? Number(params.minRoi) : undefined,
    minLiquidity: params.minLiquidity ? Number(params.minLiquidity) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    purpose: (params.purpose as any) || undefined,
    sort: (params.sort as any) || undefined,
    sortDir: 'desc' as const,
  };

  const [projects, kpis] = await Promise.all([
    getProjects(filters),
    getMarketKPIs(),
  ]);

  // If ?intel=<slug>, fetch deep data for the panel (server-rendered)
  const deepIntel = params.intel ? await getProjectDeepIntel(params.intel) : null;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-2">
              <span className="material-symbols-outlined text-sm">monitoring</span>
              Market Intelligence
            </div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-on-surface">Tổng Quan Thị Trường</h1>
            <p className="text-on-surface-variant text-sm mt-1">
              Dữ liệu giá, ROI, lợi suất cho thuê, catalyst và Titan Score của các dự án.
            </p>
          </div>
          <div className="text-xs text-on-surface-variant">
            Cập nhật: <strong className="text-on-surface">{new Date().toLocaleDateString('vi-VN')}</strong>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Avg market price */}
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Giá TB thị trường</span>
              <span className="material-symbols-outlined text-secondary text-sm">payments</span>
            </div>
            <div className="text-2xl font-black text-on-surface">{formatPricePerSqm(kpis.avgPricePerSqm)}</div>
            <div className="flex items-end justify-between mt-1">
              <span className="text-[11px] text-emerald-600 font-bold">↑ {kpis.trendUp} dự án tăng giá</span>
              {kpis.marketTrend.length >= 2 && (
                <Sparkline data={kpis.marketTrend} width={64} height={20} fill />
              )}
            </div>
          </div>

          {/* Top ROI */}
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">ROI cao nhất</span>
              <span className="material-symbols-outlined text-emerald-600 text-sm">trending_up</span>
            </div>
            {kpis.topRoi ? (
              <>
                <div className="text-2xl font-black text-emerald-600">+{Math.round(kpis.topRoi.value)}%</div>
                <Link href={`/market-overview?intel=${kpis.topRoi.slug}`} className="text-[11px] text-on-surface-variant hover:text-primary block mt-1 truncate">
                  {kpis.topRoi.name}
                </Link>
              </>
            ) : (
              <div className="text-sm text-on-surface-variant">Chưa có dữ liệu</div>
            )}
          </div>

          {/* Top yield */}
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Yield tốt nhất</span>
              <span className="material-symbols-outlined text-amber-600 text-sm">key</span>
            </div>
            {kpis.topYield ? (
              <>
                <div className="text-2xl font-black text-on-surface">{kpis.topYield.value.toFixed(1)}<span className="text-base font-bold text-on-surface-variant">%</span></div>
                <Link href={`/market-overview?intel=${kpis.topYield.slug}`} className="text-[11px] text-on-surface-variant hover:text-primary block mt-1 truncate">
                  {kpis.topYield.name}
                </Link>
              </>
            ) : (
              <div className="text-sm text-on-surface-variant">Chưa có dữ liệu</div>
            )}
          </div>

          {/* Top catalyst */}
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Catalyst mạnh nhất</span>
              <span className="material-symbols-outlined text-indigo-600 text-sm">bolt</span>
            </div>
            {kpis.topCatalyst ? (
              <>
                <div className="text-2xl font-black text-on-surface">{kpis.topCatalyst.count} <span className="text-base font-bold text-on-surface-variant">sự kiện</span></div>
                <Link href={`/market-overview?intel=${kpis.topCatalyst.slug}`} className="text-[11px] text-on-surface-variant hover:text-primary block mt-1 truncate">
                  {kpis.topCatalyst.name}
                </Link>
              </>
            ) : (
              <div className="text-sm text-on-surface-variant">Chưa có dữ liệu</div>
            )}
          </div>
        </div>
      </section>

      {/* Filters + Table */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <MarketFilters projectCount={projects.length} />
        <IntelTable projects={projects} />

        {projects.length === 0 && (
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-12 text-center mt-4">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">apartment</span>
            <p className="text-lg font-bold text-on-surface mb-2">Không tìm thấy dự án nào</p>
            <p className="text-on-surface-variant">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        )}
      </section>

      {/* AI Deep Research Panel — only renders when ?intel=<slug> */}
      {deepIntel && <AIDeepResearchPanel data={deepIntel} />}
    </div>
  );
}
