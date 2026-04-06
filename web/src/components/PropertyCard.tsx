import Image from "next/image";
import Link from "next/link";
import { Property } from "@/lib/types";
import SaveButton from "@/components/SaveButton";

interface PropertyCardProps {
  property: Property;
  isVip?: boolean;
  priority?: boolean;
  layout?: 'grid' | 'list';
}

const TYPE_LABELS: Record<string, string> = {
  "biet-thu": "Biệt thự",
  "chung-cu": "Căn hộ",
  "nha-pho": "Nhà phố",
  "dat-nen": "Đất nền",
  "phong-tro": "Phòng trọ",
  "van-phong": "Văn phòng",
  "kho-xuong": "Kho xưởng",
};

const TYPE_COLORS: Record<string, string> = {
  "biet-thu": "bg-amber-600",
  "chung-cu": "bg-blue-600",
  "nha-pho": "bg-emerald-600",
  "dat-nen": "bg-orange-500",
  "phong-tro": "bg-purple-500",
  "van-phong": "bg-teal-600",
  "kho-xuong": "bg-slate-600",
};

const PRICE_TAG_CONFIG: Record<string, { label: string; icon: string; bg: string }> = {
  hot_deal: { label: "Giá cực tốt", icon: "local_fire_department", bg: "bg-rose-500" },
  below_market: { label: "Dưới thị trường", icon: "arrow_downward", bg: "bg-emerald-500" },
  above_market: { label: "Trên thị trường", icon: "arrow_upward", bg: "bg-amber-500" },
  overpriced: { label: "Giá cao bất thường", icon: "warning", bg: "bg-red-600" },
};

const BLUR_DATA_URL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN88enTfwAJYgPNhP/y3wAAAABJRU5ErkJggg==";

function cleanTitle(title: string): string {
  if (title === title.toUpperCase() && title.length > 10) {
    return title
      .toLowerCase()
      .replace(
        /(^|\.\s*|,\s*)([a-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵđ])/g,
        (_, prefix, char) => prefix + char.toUpperCase()
      );
  }
  return title.charAt(0).toUpperCase() + title.slice(1);
}

function formatPrice(price: number, category: string): string {
  const isRent = category === "rent";

  if (isRent) {
    // Cho thuê: luôn hiển thị X triệu/tháng
    if (price >= 1_000_000_000) {
      return `${(price / 1_000_000_000).toFixed(1).replace(/\.0$/, "")} tỷ/tháng`;
    }
    if (price >= 1_000_000) {
      return `${Math.round(price / 1_000_000)} triệu/tháng`;
    }
    if (price >= 1_000) {
      return `${Math.round(price / 1_000)}k/tháng`;
    }
    return `${price} đ/tháng`;
  } else {
    // Mua bán
    if (price >= 1_000_000_000) {
      const ty = price / 1_000_000_000;
      return `${ty % 1 === 0 ? ty : ty.toFixed(1)} tỷ`;
    }
    if (price >= 1_000_000) {
      return `${Math.round(price / 1_000_000)} triệu`;
    }
    return `${price.toLocaleString("vi-VN")} đ`;
  }
}

export default function PropertyCard({ property, isVip = false, priority = false, layout = 'grid' }: PropertyCardProps) {
  const isActuallyVip = isVip || property.isFeatured || (property.priorityLevel && property.priorityLevel > 0);
  const title = cleanTitle(property.title);
  const isRent = property.category === "rent";
  const priceText = formatPrice(property.price, property.category);
  const typeLabel = TYPE_LABELS[property.type] || property.type;
  const typeBg = TYPE_COLORS[property.type] || "bg-slate-600";
  const imgSrc = property.images?.[0] || "/placeholder.jpg";

  if (layout === 'list') {
    return (
      <Link href={`/property/${property.slug}`} className="group block h-full">
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 h-full flex flex-col md:flex-row">
          {/* Image */}
          <div className="relative overflow-hidden w-full md:w-1/3 h-48 md:h-full">
            <Image
              width={600}
              height={375}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={imgSrc}
              alt={title}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={priority}
              quality={65}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
              {isActuallyVip && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-md tracking-wide w-fit">
                  VIP
                </span>
              )}
              <span className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm w-fit ${isRent ? "bg-orange-500" : "bg-[#001e40]"}`}>
                {isRent ? "CHO THUÊ" : "BÁN"}
              </span>
              {property.priceTag && PRICE_TAG_CONFIG[property.priceTag] && (
                <span className={`${PRICE_TAG_CONFIG[property.priceTag].bg} text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm w-fit flex items-center gap-1`}>
                  <span className="material-symbols-outlined text-[12px]">{PRICE_TAG_CONFIG[property.priceTag].icon}</span>
                  {PRICE_TAG_CONFIG[property.priceTag].label}
                </span>
              )}
            </div>
            <span className={`absolute top-3 right-3 ${typeBg} text-white text-[10px] font-medium px-2 py-1 rounded-md z-10`}>
              {typeLabel}
            </span>
          </div>

          {/* Content */}
          <div className="p-5 flex flex-col flex-1">
            <div className="flex justify-between items-start gap-4 mb-2">
              <h3 className="text-lg font-bold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors flex-1">
                {title}
              </h3>
              <div className="z-20">
                <SaveButton 
                  propertyId={property.id} 
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-highest text-on-surface flex items-center justify-center transition-colors"
                />
              </div>
            </div>

            <div className="text-2xl font-black text-primary mb-3">
              {priceText}
            </div>

            <div className="flex items-center gap-1.5 text-on-surface-variant text-sm mb-4">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              <span className="truncate">
                {[property.address, property.district, property.city].filter(Boolean).join(", ")}
              </span>
            </div>
            
            <p className="text-sm text-on-surface-variant line-clamp-2 mb-4 flex-1">
              {property.description?.trim().split('\n')[0] || ''}
            </p>

            <div className="flex items-center gap-4 mt-auto pt-4 border-t border-outline-variant/15 text-sm text-on-surface-variant">
              {property.bedrooms > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">bed</span>
                  <span className="font-medium">{property.bedrooms} PN</span>
                </div>
              )}
              {property.bathrooms > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">shower</span>
                  <span className="font-medium">{property.bathrooms} WC</span>
                </div>
              )}
              {property.area > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">square_foot</span>
                  <span className="font-medium">{property.area} m²</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/property/${property.slug}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <Image
            width={600}
            height={375}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={imgSrc}
            alt={title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={priority}
            quality={65}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
          />

          {/* Top-left badges: stack vertically to avoid overlap */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {/* VIP badge (if applicable) */}
            {isActuallyVip && (
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-md shadow-md tracking-wide w-fit">
                VIP
              </span>
            )}
            {/* Sale/Rent badge */}
            <span
              className={`text-white text-[10px] font-bold px-2.5 py-1 rounded-md shadow-sm w-fit ${
                isRent
                  ? "bg-orange-500"
                  : "bg-[#001e40]"
              }`}
            >
              {isRent ? "CHO THUÊ" : "BÁN"}
            </span>
            {/* Price anomaly badge */}
            {property.priceTag && PRICE_TAG_CONFIG[property.priceTag] && (
              <span className={`${PRICE_TAG_CONFIG[property.priceTag].bg} text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm w-fit flex items-center gap-1`}>
                <span className="material-symbols-outlined text-[12px]">{PRICE_TAG_CONFIG[property.priceTag].icon}</span>
                {PRICE_TAG_CONFIG[property.priceTag].label}
              </span>
            )}
          </div>

          {/* Top-right: Type badge */}
          <span
            className={`absolute top-3 right-3 ${typeBg} text-white text-[10px] font-medium px-2 py-1 rounded-md z-10`}
          >
            {typeLabel}
          </span>

          {/* Bottom: Price on gradient */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-3 pt-10 flex justify-between items-end">
            <span className="text-white font-bold text-[17px] drop-shadow-lg">
              {priceText}
            </span>
            <div className="z-20">
              <SaveButton 
                propertyId={property.id} 
                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-[14px] font-semibold text-on-surface leading-snug line-clamp-2 group-hover:text-primary transition-colors mb-2">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-3">
            <span className="material-symbols-outlined text-[13px] text-secondary">location_on</span>
            <span className="truncate">
              {[property.district, property.city].filter(Boolean).join(", ")}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-auto pt-3 border-t border-outline-variant/15 text-[11px] text-on-surface-variant">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">bed</span>
                <span className="font-medium">{property.bedrooms} PN</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">shower</span>
                <span className="font-medium">{property.bathrooms} WC</span>
              </div>
            )}
            {property.area > 0 && (
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[13px]">square_foot</span>
                <span className="font-medium">{property.area} m²</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
