export const revalidate = 3600;

import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import PropertyCard from "@/components/PropertyCard";
import { getProjectBySlug, getProjectProperties, getProjectDeepIntel } from "@/lib/queries/projects";
import IntelHero from "./IntelHero";
import PriceChartDeep from "./PriceChartDeep";
import CatalystTimeline from "./CatalystTimeline";
import RiskDashboard from "./RiskDashboard";
import ROICalculator from "@/components/calculator/ROICalculator";

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

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Không tìm thấy dự án" };
  return {
    title: `${project.name} | ${project.district}, ${project.city}`,
    description: `Dự án ${project.name} tại ${project.district}, ${project.city}. Phân tích Titan Score, ROI từ mở bán, yield, catalyst và rủi ro.`,
    openGraph: {
      title: project.name,
      images: project.coverImage ? [{ url: project.coverImage }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [project, deep, properties] = await Promise.all([
    getProjectBySlug(slug),
    getProjectDeepIntel(slug),
    getProjectBySlug(slug).then((p) => p ? getProjectProperties(p.id, 12) : []),
  ]);
  if (!project) notFound();

  const intel = project.intel;

  return (
    <div className="min-h-screen bg-surface pt-24 pb-16">
      {/* Breadcrumb */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-4">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link href="/market-overview" className="hover:text-primary">Market Intelligence</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <span className="text-primary font-bold">{project.name}</span>
        </div>
      </section>

      {/* Header gallery + name */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden h-56 md:h-72">
          <div className="col-span-4 md:col-span-2 relative bg-slate-200">
            {project.coverImage && (
              <Image src={project.coverImage} alt={project.name} fill className="object-cover" sizes="50vw" priority />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] bg-white/20 text-white px-2 py-0.5 rounded-full mb-2 backdrop-blur-sm">
                <span className="material-symbols-outlined text-xs">monitoring</span>
                Project Intelligence
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-2 text-white/80 text-sm mt-1">
                <span className="material-symbols-outlined text-sm">location_on</span>
                {project.district}, {project.city}
                {project.developer && <span className="opacity-70">· {project.developer}</span>}
              </div>
            </div>
          </div>
          {deep?.project && deep.project.coverImage && (
            <>
              <div className="hidden md:block col-span-1 relative bg-slate-200">
                {project.coverImage && <Image src={project.coverImage} alt={`${project.name} 2`} fill className="object-cover" sizes="25vw" />}
              </div>
              <div className="hidden md:block col-span-1 relative bg-slate-200">
                {project.coverImage && <Image src={project.coverImage} alt={`${project.name} 3`} fill className="object-cover" sizes="25vw" />}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Intel Hero: scores + KPIs + CTAs */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <IntelHero project={project} />
      </section>

      {/* Strengths / Weaknesses */}
      {intel && (intel.strengths.length > 0 || intel.weaknesses.length > 0) && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {intel.strengths.length > 0 && (
              <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
                <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  Điểm mạnh
                </h3>
                <ul className="space-y-1.5 text-sm text-on-surface">
                  {intel.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {intel.weaknesses.length > 0 && (
              <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
                <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">info</span>
                  Điểm yếu
                </h3>
                <ul className="space-y-1.5 text-sm text-on-surface">
                  {intel.weaknesses.map((s, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="text-amber-600 font-bold">!</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Price Chart */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <PriceChartDeep
          history={deep?.priceHistory || []}
          currentPricePerSqm={project.avgPricePerSqm}
          projectName={project.name}
        />
      </section>

      {/* Project info card */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">info</span>
            Thông tin dự án
          </h3>
          {project.description && <p className="text-on-surface-variant leading-relaxed mb-5 text-sm">{project.description}</p>}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            {project.developer && <Field label="Chủ đầu tư" value={project.developer} />}
            {project.priceRange && <Field label="Khoảng giá" value={project.priceRange} highlight="primary" />}
            {project.legalStatus && <Field label="Pháp lý" value={project.legalStatus} highlight="emerald" icon="verified" />}
            {project.completionDate && <Field label="Bàn giao" value={project.completionDate} />}
            {project.totalUnits && <Field label="Quy mô" value={`${project.totalUnits.toLocaleString("vi-VN")} căn`} />}
            {project.floors && <Field label="Số tầng" value={`${project.floors} tầng${project.blocks ? ` / ${project.blocks} block` : ""}`} />}
            {project.totalAreaHa && <Field label="Diện tích" value={`${project.totalAreaHa} ha`} />}
            {project.handoverStandard && <Field label="Tiêu chuẩn bàn giao" value={project.handoverStandard} />}
          </div>
          {project.apartmentTypes.length > 0 && (
            <div className="mt-5 pt-4 border-t border-outline-variant/15">
              <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-2">Loại căn hộ</div>
              <div className="flex flex-wrap gap-1.5">
                {project.apartmentTypes.map((t) => (
                  <span key={t} className="bg-primary/5 text-primary text-xs font-bold px-2.5 py-1 rounded-full">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Catalyst + Risk side-by-side on lg */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CatalystTimeline catalysts={deep?.catalysts || []} />
          {intel ? (
            <RiskDashboard intel={intel} />
          ) : (
            <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-outline mb-2">warning</span>
              <p className="text-sm text-on-surface-variant">Chưa có dữ liệu rủi ro.</p>
            </div>
          )}
        </div>
      </section>

      {/* ROI Calculator embed */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
        <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
          <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">calculate</span>
            Mô phỏng đầu tư
            <span className="text-[11px] font-medium text-on-surface-variant ml-2">prefill từ giá hiện tại</span>
          </h3>
          <ROICalculator />
        </div>
      </section>

      {/* Compare nearby */}
      {deep?.nearby && deep.nearby.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mb-6">
          <div className="bg-white rounded-2xl border border-outline-variant/20 p-5">
            <h3 className="font-bold text-on-surface mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">compare_arrows</span>
              Dự án cùng khu cần xem
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {deep.nearby.map((n) => (
                <Link key={n.slug} href={`/projects/${n.slug}`} className="block bg-surface-container-lowest rounded-xl p-3 hover:bg-surface-container-low transition-colors">
                  <div className="font-bold text-on-surface text-sm">{n.name}</div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-xs text-on-surface-variant">{n.avgPricePerSqm > 0 ? `${(n.avgPricePerSqm / 1_000_000).toFixed(1)} tr/m²` : "—"}</span>
                    {n.titanScore != null && (
                      <span className="text-xs font-bold bg-white px-2 py-0.5 rounded">{n.titanScore.toFixed(1)}/10</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Properties listing */}
      <section className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-on-surface">
            Sản phẩm trong dự án ({properties.length})
          </h2>
          <Link href={`/listings?q=${encodeURIComponent(project.name)}`} className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
            Xem tất cả <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.map((property, index) => (
              <PropertyCard key={property.id} property={property} priority={index < 2} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-outline-variant/20 bg-white p-8 text-center">
            <span className="material-symbols-outlined text-5xl text-outline mb-3">home_work</span>
            <p className="text-base font-bold text-on-surface mb-1">Chưa có sản phẩm</p>
            <p className="text-on-surface-variant text-sm">Dự án này chưa có sản phẩm nào được đăng.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, value, highlight, icon }: { label: string; value: string; highlight?: 'primary' | 'emerald'; icon?: string }) {
  const cls = highlight === 'primary' ? 'text-primary' : highlight === 'emerald' ? 'text-emerald-600' : 'text-on-surface';
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant mb-0.5">{label}</div>
      <div className={`font-bold ${cls} flex items-center gap-1`}>
        {icon && <span className="material-symbols-outlined text-[14px]">{icon}</span>}
        {value}
      </div>
    </div>
  );
}
