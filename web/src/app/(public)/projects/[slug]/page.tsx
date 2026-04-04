export const revalidate = 3600;

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PropertyCard from "@/components/PropertyCard";
import { getProjectBySlug, getProjectProperties } from "@/lib/queries/projects";

const TYPE_LABELS: Record<string, string> = {
  "chung-cu": "Chung cư",
  "nha-pho": "Nhà phố",
  "biet-thu": "Biệt thự",
  "dat-nen": "Đất nền",
  "phong-tro": "Phòng trọ",
  "van-phong": "Văn phòng",
  "kho-xuong": "Kho xưởng",
};

function formatPrice(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ`;
  if (value >= 1_000_000) return `${Math.round(value / 1_000_000)} triệu`;
  return `${value.toLocaleString("vi-VN")} đ`;
}

function formatPricePerSqm(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")} tr/m²`;
  return `${Math.round(value).toLocaleString("vi-VN")}/m²`;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Không tìm thấy dự án" };
  return {
    title: `${project.name} | ${project.district}, ${project.city}`,
    description: `Dự án ${project.name} tại ${project.district}, ${project.city}. ${project.propertyCount} sản phẩm, giá từ ${formatPrice(project.minPrice)}.`,
    openGraph: {
      title: project.name,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();
  const properties = await getProjectProperties(project.id, 24);

  const totalTypes = Object.values(project.typeBreakdown).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      {/* Breadcrumb */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/market-overview" className="hover:text-primary">Thị trường</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-bold">{project.name}</span>
        </div>
      </section>

      {/* Hero with Gallery */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-8">
        <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-64 md:h-80">
          {/* Main image */}
          <div className="col-span-4 md:col-span-2 relative bg-slate-200">
            {project.gallery[0] && (
              <Image src={project.gallery[0]} alt={project.name} fill className="object-cover" sizes="50vw" priority />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-2 text-white/80 text-sm mt-2">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {project.district}, {project.city}
              </div>
            </div>
          </div>
          {/* Side images */}
          {project.gallery.slice(1, 3).map((img, i) => (
            <div key={i} className="hidden md:block col-span-1 relative bg-slate-200">
              <Image src={img} alt={`${project.name} ${i + 2}`} fill className="object-cover" sizes="25vw" />
            </div>
          ))}
        </div>
      </section>

      {/* Stats Cards */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-outline-variant/20 p-4 text-center">
            <span className="material-symbols-outlined text-primary text-2xl mb-1">home_work</span>
            <div className="text-2xl font-black text-on-surface">{project.propertyCount}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Sản phẩm</div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant/20 p-4 text-center">
            <span className="material-symbols-outlined text-emerald-600 text-2xl mb-1">trending_up</span>
            <div className="text-2xl font-black text-on-surface">{formatPrice(project.minPrice)}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Giá thấp nhất</div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant/20 p-4 text-center">
            <span className="material-symbols-outlined text-rose-500 text-2xl mb-1">trending_down</span>
            <div className="text-2xl font-black text-on-surface">{formatPrice(project.maxPrice)}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Giá cao nhất</div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant/20 p-4 text-center">
            <span className="material-symbols-outlined text-secondary text-2xl mb-1">payments</span>
            <div className="text-2xl font-black text-on-surface">{project.avgPricePerSqm > 0 ? formatPricePerSqm(project.avgPricePerSqm) : "—"}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Giá TB/m²</div>
          </div>
          <div className="bg-white rounded-xl border border-outline-variant/20 p-4 text-center">
            <span className="material-symbols-outlined text-amber-600 text-2xl mb-1">square_foot</span>
            <div className="text-2xl font-black text-on-surface">{project.avgArea > 0 ? `${Math.round(project.avgArea)} m²` : "—"}</div>
            <div className="text-[11px] text-on-surface-variant font-medium">Diện tích TB</div>
          </div>
        </div>
      </section>

      {/* Analysis Section: Type Breakdown + Price Distribution */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type Breakdown */}
          {Object.keys(project.typeBreakdown).length > 0 && (
            <div className="bg-white rounded-2xl border border-outline-variant/20 p-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">pie_chart</span>
                Phân bổ loại hình
              </h3>
              <div className="space-y-3">
                {Object.entries(project.typeBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const pct = totalTypes > 0 ? Math.round((count / totalTypes) * 100) : 0;
                    return (
                      <div key={type}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-on-surface font-medium">{TYPE_LABELS[type] || type}</span>
                          <span className="text-on-surface-variant">{count} SP ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Price Distribution */}
          {project.priceRanges.length > 0 && (
            <div className="bg-white rounded-2xl border border-outline-variant/20 p-6">
              <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">bar_chart</span>
                Phân bổ giá
              </h3>
              <div className="space-y-3">
                {project.priceRanges.map((range) => {
                  const maxCount = Math.max(...project.priceRanges.map((r) => r.count));
                  const pct = maxCount > 0 ? Math.round((range.count / maxCount) * 100) : 0;
                  return (
                    <div key={range.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-on-surface font-medium">{range.label}</span>
                        <span className="text-on-surface-variant">{range.count} SP</span>
                      </div>
                      <div className="w-full h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <div
                          className="h-full bg-secondary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Sale/Rent breakdown */}
      {Object.keys(project.categoryBreakdown).length > 1 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-10">
          <div className="flex gap-3">
            {Object.entries(project.categoryBreakdown).map(([cat, count]) => (
              <div key={cat} className={`flex-1 rounded-xl p-4 text-center ${cat === 'rent' ? 'bg-orange-50 border border-orange-200' : 'bg-primary/5 border border-primary/20'}`}>
                <div className={`text-2xl font-black ${cat === 'rent' ? 'text-orange-600' : 'text-primary'}`}>{count}</div>
                <div className="text-xs font-medium text-on-surface-variant">{cat === 'rent' ? 'Cho thuê' : 'Mua bán'}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Property Listings */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-on-surface">
            Sản phẩm trong dự án ({properties.length})
          </h2>
          <Link href={`/listings?q=${encodeURIComponent(project.name)}`} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>

        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <PropertyCard key={property.id} property={property} priority={index < 2} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-12 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-4">home_work</span>
            <p className="text-lg font-bold text-on-surface mb-2">Chưa có sản phẩm</p>
            <p className="text-on-surface-variant">Dự án này chưa có sản phẩm nào được đăng.</p>
          </div>
        )}
      </section>
    </div>
  );
}
