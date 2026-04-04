export const revalidate = 600; // ISR 10 phút

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { getProjects, getMarketKPIs } from "@/lib/queries/projects";
import MarketFilters from "./MarketFilters";

export const metadata: Metadata = {
  title: "Tổng quan thị trường | Dự án BĐS",
  description: "Phân tích thị trường bất động sản Việt Nam. Theo dõi giá, xu hướng, và dự án nổi bật tại TP.HCM, Hà Nội và 63 tỉnh thành.",
};

const TYPE_LABELS: Record<string, string> = {
  "chung-cu": "Chung cư",
  "nha-pho": "Nhà phố",
  "biet-thu": "Biệt thự",
  "dat-nen": "Đất nền",
  "phong-tro": "Phòng trọ",
  "van-phong": "Văn phòng",
};

function formatPrice(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)} tr`;
  return `${value.toLocaleString("vi-VN")}`;
}

function formatPricePerSqm(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")} tr/m²`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}k/m²`;
  return `${Math.round(value)}/m²`;
}

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; city?: string; sort?: string; view?: string }>;
}

export default async function MarketOverviewPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const [projects, kpis] = await Promise.all([
    getProjects({
      search: params.q,
      status: params.status,
      city: params.city,
      sort: (params.sort as any) || "property_count",
      sortDir: "desc",
    }),
    getMarketKPIs(),
  ]);

  const viewMode = params.view || "grid";

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="rounded-3xl overflow-hidden bg-gradient-to-r from-[#001e40] to-[#006c47] text-white p-8 md:p-12 shadow-xl relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] bg-white/15 px-3 py-1 rounded-full mb-4">
              <span className="material-symbols-outlined text-sm">monitoring</span>
              Market Overview
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-3">Tổng Quan Thị Trường</h1>
            <p className="text-white/80 max-w-2xl text-sm md:text-base leading-7">
              Phân tích thị trường bất động sản từ {kpis.totalProperties.toLocaleString("vi-VN")}+ sản phẩm
              tại {kpis.totalProjects} dự án nổi bật trên toàn quốc.
            </p>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">apartment</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Dự án</span>
            </div>
            <div className="text-3xl font-black text-on-surface">{kpis.totalProjects}</div>
            <div className="text-xs text-on-surface-variant mt-1">{kpis.totalProperties.toLocaleString("vi-VN")} sản phẩm</div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/20 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary text-xl">payments</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Giá TB/m²</span>
            </div>
            <div className="text-3xl font-black text-on-surface">{formatPricePerSqm(kpis.avgPricePerSqm)}</div>
            <div className="text-xs text-on-surface-variant mt-1">Trung bình toàn thị trường</div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/20 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-xl">trending_up</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Xu hướng</span>
            </div>
            <div className="text-3xl font-black text-emerald-600">{kpis.trendUp}</div>
            <div className="text-xs text-on-surface-variant mt-1">dự án tăng giá / {kpis.trendDown} giảm</div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/20 p-5 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-600 text-xl">new_releases</span>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Mới 7 ngày</span>
            </div>
            <div className="text-3xl font-black text-on-surface">{kpis.newListings7d.toLocaleString("vi-VN")}</div>
            <div className="text-xs text-on-surface-variant mt-1">tin đăng mới</div>
          </div>
        </div>
      </section>

      {/* Filters + Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <MarketFilters projectCount={projects.length} />

        {/* Project Grid */}
        {viewMode === "table" ? (
          /* Table View */
          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant/20">
                    <th className="text-left px-6 py-4 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Dự án</th>
                    <th className="text-left px-4 py-4 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Vị trí</th>
                    <th className="text-right px-4 py-4 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Giá/m²</th>
                    <th className="text-right px-4 py-4 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Giá thấp nhất</th>
                    <th className="text-center px-4 py-4 font-bold text-xs uppercase tracking-wider text-on-surface-variant">Số SP</th>
                    <th className="text-center px-4 py-4 font-bold text-xs uppercase tracking-wider text-on-surface-variant">DT TB</th>
                    <th className="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/projects/${project.slug}`} className="flex items-center gap-3 group">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                            {project.coverImage && (
                              <Image src={project.coverImage} alt={project.name} width={40} height={40} className="w-full h-full object-cover" />
                            )}
                          </div>
                          <span className="font-bold text-on-surface group-hover:text-primary transition-colors">{project.name}</span>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-on-surface-variant">{project.district}, {project.city}</td>
                      <td className="px-4 py-4 text-right font-semibold text-on-surface">
                        {project.avgPricePerSqm > 0 ? formatPricePerSqm(project.avgPricePerSqm) : "—"}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-primary">
                        {project.minPrice > 0 ? formatPrice(project.minPrice) : "Liên hệ"}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center bg-primary/10 text-primary text-xs font-bold rounded-full px-2.5 py-1 min-w-[32px]">
                          {project.propertyCount}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-on-surface-variant">
                        {project.avgArea > 0 ? `${Math.round(project.avgArea)} m²` : "—"}
                      </td>
                      <td className="px-4 py-4">
                        <Link href={`/projects/${project.slug}`} className="text-primary hover:underline text-xs font-bold">
                          Chi tiết →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="group block bg-white rounded-2xl border border-outline-variant/20 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Image */}
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  {project.coverImage ? (
                    <Image
                      src={project.coverImage}
                      alt={project.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl text-slate-300">apartment</span>
                    </div>
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-primary/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                      {project.propertyCount} SP
                    </span>
                    {project.status === "selling" && (
                      <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-md backdrop-blur-sm">
                        Đang bán
                      </span>
                    )}
                  </div>
                  {/* Price overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-8">
                    <span className="text-white font-bold text-lg drop-shadow-lg">
                      {project.minPrice > 0 ? `Từ ${formatPrice(project.minPrice)}` : "Liên hệ"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors mb-1 line-clamp-1">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-4">
                    <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                    <span className="truncate">{project.district}, {project.city}</span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-4 border-t border-outline-variant/15">
                    <div className="text-center">
                      <div className="text-[11px] text-on-surface-variant mb-0.5">Giá/m²</div>
                      <div className="text-xs font-bold text-on-surface">
                        {project.avgPricePerSqm > 0 ? formatPricePerSqm(project.avgPricePerSqm) : "—"}
                      </div>
                    </div>
                    <div className="text-center border-x border-outline-variant/15">
                      <div className="text-[11px] text-on-surface-variant mb-0.5">DT TB</div>
                      <div className="text-xs font-bold text-on-surface">
                        {project.avgArea > 0 ? `${Math.round(project.avgArea)} m²` : "—"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[11px] text-on-surface-variant mb-0.5">Cao nhất</div>
                      <div className="text-xs font-bold text-on-surface">
                        {project.maxPrice > 0 ? formatPrice(project.maxPrice) : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {projects.length === 0 && (
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">apartment</span>
            <p className="text-lg font-bold text-on-surface mb-2">Không tìm thấy dự án nào</p>
            <p className="text-on-surface-variant">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
          </div>
        )}
      </section>
    </div>
  );
}
