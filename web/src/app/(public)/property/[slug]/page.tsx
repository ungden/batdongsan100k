export const revalidate = 1800; // ISR 30 phút

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPropertyBySlug, getSimilarProperties, incrementViewCount } from "@/lib/queries/properties";
import ContactForm from "./ContactForm";
import MapWrapper from "./MapWrapper";
import Image from "next/image";
import SaveButton from "@/components/SaveButton";

const TYPE_LABELS: Record<string, string> = {
  'biet-thu': 'Biệt Thự',
  'chung-cu': 'Căn Hộ',
  'nha-pho': 'Nhà Phố',
  'dat-nen': 'Đất Nền',
  'phong-tro': 'Phòng Trọ',
  'van-phong': 'Văn Phòng',
  'kho-xuong': 'Kho/Xưởng',
};

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) return { title: 'Không tìm thấy' };

  const typeLabel = TYPE_LABELS[property.type] || property.type;
  const location = [property.district, property.city].filter(Boolean).join(', ');
  const isRent = property.category === 'rent';
  const priceText = property.price >= 1_000_000_000
    ? `${(property.price / 1_000_000_000).toFixed(1).replace(/\.0$/, '')} tỷ`
    : property.price >= 1_000_000
      ? `${Math.round(property.price / 1_000_000)} triệu${isRent ? '/tháng' : ''}`
      : 'Liên hệ';
  const title = `${property.title} | ${priceText}`;
  const description = `${isRent ? 'Cho thuê' : 'Bán'} ${typeLabel} ${location}. Giá ${priceText}. Diện tích ${property.area}m². ${property.bedrooms ? property.bedrooms + ' phòng ngủ. ' : ''}${property.description?.slice(0, 120) || ''}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: property.images?.[0] ? [{ url: property.images[0], width: 800, height: 600 }] : undefined,
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

  // Track view count (non-blocking)
  incrementViewCount(property.id);

  const similarProperties = await getSimilarProperties(
    { type: property.type, city: property.city, id: property.id },
    3,
  );

  const featureIcons: Record<string, string> = {
    "Ho boi": "pool",
    "Phong gym": "fitness_center",
    "Bao ve 24/7": "security",
    "Thang may": "elevator",
    "Ban cong": "balcony",
    "San vuon": "eco",
    "Gara o to": "local_parking",
    "Dieu hoa": "ac_unit",
    "Noi that cao cap": "chair",
    "View song": "water",
    "Gan truong hoc": "school",
    "Bai do xe": "local_parking",
  };

  return (
    <div className="pt-24 pb-20">
      {/* Hero Gallery */}
      <section className="max-w-7xl mx-auto px-8 mb-12">
        <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[300px] md:h-[500px] lg:h-[600px]">
          <div className="col-span-4 md:col-span-2 row-span-2 relative overflow-hidden rounded-lg">
            <Image width={800} height={600}
              className="w-full h-full object-cover"
              src={property.images[0]}
              alt={property.title}
            />
            <div className="absolute bottom-6 left-6 flex gap-2">
              <span className="bg-secondary-container text-on-secondary-container px-3 py-1 text-xs font-bold tracking-widest rounded-sm uppercase">
                {TYPE_LABELS[property.type] || property.type}
              </span>
              <span className="bg-black/50 backdrop-blur-md text-white px-3 py-1 text-xs font-medium rounded-sm">
                {property.images.length}+ Ảnh
              </span>
            </div>
          </div>
          {property.images.length > 1 && (
            <div className="hidden md:block col-span-2 row-span-1 relative overflow-hidden rounded-lg">
              <Image width={800} height={600}
                className="w-full h-full object-cover"
                src={property.images[1]}
                alt={`${property.title} - Ảnh 2`}
              />
            </div>
          )}
          {property.images.length > 2 && (
            <>
              <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden rounded-lg">
                <Image width={800} height={600}
                  className="w-full h-full object-cover"
                  src={property.images[2]}
                  alt={`${property.title} - Ảnh 3`}
                />
              </div>
              <div className="hidden md:block col-span-1 row-span-1 relative overflow-hidden rounded-lg">
                <Image width={800} height={600}
                  className="w-full h-full object-cover"
                  src={property.images[property.images.length > 3 ? 0 : 0]}
                  alt={`${property.title} - Ảnh 4`}
                />
                {property.images.length > 3 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer hover:bg-black/20 transition-all">
                    <span className="text-white font-bold text-lg">
                      +{property.images.length - 3} Xem thêm
                    </span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Main Content & Sidebar */}
      <section className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Content Left (8 cols) */}
        <div className="lg:col-span-8 space-y-12">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h1 className="text-4xl font-extrabold text-on-surface tracking-tight leading-tight">
                {property.title}
              </h1>
              <div className="pt-2">
                <SaveButton 
                  propertyId={property.id} 
                  showText={true}
                  className="px-4 py-2 bg-surface-container-low hover:bg-surface-container border border-outline-variant/20 rounded-full flex gap-2 font-medium"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 text-on-surface-variant">
              <span className="material-symbols-outlined text-secondary">location_on</span>
              <p className="text-lg">
                {property.address}, {property.district}, {property.city}
              </p>
            </div>
            <div className="flex items-end gap-6 pt-4">
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-widest text-outline uppercase">
                  Giá Bán
                </span>
                <div className="text-3xl font-extrabold text-primary">
                  {property.priceFormatted} {property.priceUnit === "triệu" ? "Triệu" : "Tỷ"}
                </div>
              </div>
              <div className="h-10 w-[1px] bg-outline-variant/30 mb-1"></div>
              <div className="space-y-1">
                <span className="text-xs font-bold tracking-widest text-outline uppercase">
                  Diện Tích
                </span>
                <div className="text-3xl font-extrabold text-on-surface">
                  {property.area} m²
                </div>
              </div>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 bg-surface-container-low rounded-xl">
            {property.direction && (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-primary-fixed-dim">explore</span>
                <div className="text-xs font-bold text-outline uppercase">Hướng</div>
                <div className="font-semibold">{property.direction}</div>
              </div>
            )}
            {property.bedrooms > 0 && (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-primary-fixed-dim">bed</span>
                <div className="text-xs font-bold text-outline uppercase">Phòng Ngủ</div>
                <div className="font-semibold">{property.bedrooms} Phòng</div>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="space-y-2">
                <span className="material-symbols-outlined text-primary-fixed-dim">bathtub</span>
                <div className="text-xs font-bold text-outline uppercase">Phòng Tắm</div>
                <div className="font-semibold">{property.bathrooms} Phòng</div>
              </div>
            )}
            <div className="space-y-2">
              <span className="material-symbols-outlined text-primary-fixed-dim">square_foot</span>
              <div className="text-xs font-bold text-outline uppercase">Diện Tích</div>
              <div className="font-semibold">{property.area} m²</div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,33,19,0.06)] border border-outline-variant/10 space-y-6">
            <h2 className="text-2xl font-bold text-on-surface">Mô Tả Chi Tiết</h2>
            <div className="prose max-w-none text-on-surface-variant leading-relaxed space-y-4">
              {property.description?.trim().split('\n').map((paragraph, index) => (
                paragraph.trim() ? <p key={index}>{paragraph}</p> : null
              ))}
              {property.floor && (
                <p>
                  <strong>Tầng:</strong> {property.floor}
                </p>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-on-surface">Tiện Ích Nội Khu</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
              {property.features.map((feature: string) => (
                <div key={feature} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-secondary">
                    {featureIcons[feature] || "check_circle"}
                  </span>
                  <span className="text-on-surface">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Map Integration */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-on-surface">Vị Trí Trên Bản Đồ</h2>
            {property.latitude && property.longitude ? (
              <MapWrapper
                latitude={property.latitude}
                longitude={property.longitude}
                title={property.title}
                address={`${property.address}, ${property.city}`}
              />
            ) : (
              <div className="w-full h-[400px] rounded-xl overflow-hidden bg-surface-container relative flex items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-4xl text-outline mb-2">map</span>
                  <p className="text-on-surface-variant text-sm">Chưa có tọa độ bản đồ</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 mt-3">
              <span className="material-symbols-outlined text-secondary text-lg">location_on</span>
              <p className="text-on-surface-variant font-medium">
                {property.address}, {property.city}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4">
          <div className="sticky top-28 space-y-6">
            {/* Agent Card */}
            <div className="bg-surface-container-lowest p-8 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,33,19,0.06)] border border-outline-variant/10">
              <Link href={`/agent/${property.agent.id}`} className="flex items-center gap-4 mb-6 hover:bg-surface-container-low transition-colors rounded-xl p-2 -m-2">
                <div className="w-20 h-20 rounded-full overflow-hidden shrink-0">
                  <Image width={80} height={80}
                    alt={property.agent.name}
                    className="w-full h-full object-cover"
                    src={property.agent.avatar}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-on-surface hover:text-primary transition-colors">{property.agent.name}</h3>
                  <p className="text-sm text-on-surface-variant">Chuyên viên tư vấn cao cấp</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span
                      className="material-symbols-outlined text-secondary-container text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      star
                    </span>
                    <span className="text-xs font-bold text-secondary">4.9 (124 đánh giá)</span>
                  </div>
                </div>
              </Link>

              {/* Contact Form */}
              <ContactForm
                propertyId={property.id}
                agentId={property.agent.id}
                agentPhone={property.agent.phone}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="max-w-7xl mx-auto px-8 mt-24">
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-2">
              <span className="text-xs font-bold tracking-[0.2em] text-secondary uppercase">
                Khám phá thêm
              </span>
              <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">
                Bất Động Sản Tương Tự
              </h2>
            </div>
            <Link
              href="/listings"
              className="text-sm font-bold text-primary border-b-2 border-primary pb-1 flex items-center gap-2"
            >
              Xem tất cả{" "}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {similarProperties.map((p) => (
              <Link
                key={p.id}
                href={`/property/${p.slug}`}
                className="group cursor-pointer"
              >
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden mb-6">
                  <Image width={800} height={600}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={p.images[0]}
                    alt={p.title}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-secondary-container text-on-secondary-container text-[10px] font-bold px-3 py-1 rounded-sm uppercase tracking-widest">
                      {TYPE_LABELS[p.type] || p.type}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-sm text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {p.district}, {p.city}
                  </p>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xl font-extrabold text-primary">
                      {p.priceFormatted} {p.priceUnit === "triệu" ? "Triệu" : "Tỷ"}
                    </div>
                    <div className="text-sm font-medium text-on-surface-variant">
                      {p.area} m²
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Sticky Footer Actions (Mobile) */}
      <div className="fixed bottom-0 w-full z-50 bg-white border-t border-outline-variant/20 px-5 h-20 flex items-center gap-3 lg:hidden">
        <button className="flex-1 h-12 bg-surface-container-high text-on-primary-fixed-variant font-bold rounded-md flex items-center justify-center gap-2 active:scale-95 transition-transform duration-200">
          <span className="material-symbols-outlined">chat_bubble</span>
          Message
        </button>
        <button className="flex-1 h-12 bg-gradient-to-br from-[#001e40] to-[#003366] text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform duration-200">
          <span className="material-symbols-outlined">call</span>
          Call Now
        </button>
      </div>
    </div>
  );
}
