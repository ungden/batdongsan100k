"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

const CITY_OPTIONS = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Đồng Nai', 'Bình Dương', 'Khánh Hòa'];
const SALE_PRICE_OPTIONS = [
  { value: '', label: 'Tất cả mức giá' },
  { value: '0-3000000000', label: 'Dưới 3 tỷ' },
  { value: '3000000000-5000000000', label: '3 - 5 tỷ' },
  { value: '5000000000-10000000000', label: '5 - 10 tỷ' },
  { value: '10000000000-30000000000', label: '10 - 30 tỷ' },
  { value: '30000000000-0', label: 'Trên 30 tỷ' },
];
const RENT_PRICE_OPTIONS = [
  { value: '', label: 'Tất cả mức giá' },
  { value: '0-3000000', label: 'Dưới 3 triệu/tháng' },
  { value: '3000000-5000000', label: '3 - 5 triệu/tháng' },
  { value: '5000000-10000000', label: '5 - 10 triệu/tháng' },
  { value: '10000000-20000000', label: '10 - 20 triệu/tháng' },
  { value: '20000000-50000000', label: '20 - 50 triệu/tháng' },
  { value: '50000000-0', label: 'Trên 50 triệu/tháng' },
];
const AREA_OPTIONS = [
  { value: '', label: 'Tất cả diện tích' },
  { value: '0-50', label: 'Dưới 50 m²' },
  { value: '50-100', label: '50 - 100 m²' },
  { value: '100-200', label: '100 - 200 m²' },
  { value: '200-500', label: '200 - 500 m²' },
  { value: '500-0', label: 'Trên 500 m²' },
];
const DIRECTION_OPTIONS = ['', 'Đông', 'Tây', 'Nam', 'Bắc', 'Đông Nam', 'Đông Bắc', 'Tây Nam', 'Tây Bắc'];
const FEATURE_OPTIONS = ['', 'Hồ bơi', 'Phòng gym', 'Bảo vệ 24/7', 'Thang máy', 'Ban công', 'Sân vườn'];
const SORT_OPTIONS = [
  { value: 'latest', label: 'Mới đăng nhất' },
  { value: 'price_asc', label: 'Giá: Thấp đến Cao' },
  { value: 'price_desc', label: 'Giá: Cao đến Thấp' },
  { value: 'area_desc', label: 'Diện tích: Lớn nhất' },
];

export default function ListingsSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Helper to update URL
  const updateQuery = useCallback((updates: Record<string, string | undefined>) => {
    const sp = new URLSearchParams(searchParams.toString());
    // Reset page on filter change
    sp.delete("page");
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        sp.set(key, value);
      } else {
        sp.delete(key);
      }
    });

    router.push(`${pathname}?${sp.toString()}`);
  }, [searchParams, pathname, router]);

  // Read current values
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  const category = searchParams.get("category") || "";
  const city = searchParams.get("city") || "";
  const district = searchParams.get("district") || "";
  const price = searchParams.get("price") || "";
  const area = searchParams.get("area") || "";
  const bedrooms = searchParams.get("bedrooms") || "";
  const bathrooms = searchParams.get("bathrooms") || "";
  const direction = searchParams.get("direction") || "";
  const feature = searchParams.get("feature") || "";
  const sort = searchParams.get("sort") || "latest";

  // Local state for debounced text inputs
  const [localQ, setLocalQ] = useState(q);
  const [localDistrict, setLocalDistrict] = useState(district);

  // Sync local state when URL changes externally
  useEffect(() => { setLocalQ(q); }, [q]);
  useEffect(() => { setLocalDistrict(district); }, [district]);

  // Debounce text inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localQ !== q) updateQuery({ q: localQ });
    }, 500);
    return () => clearTimeout(timer);
  }, [localQ, q, updateQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localDistrict !== district) updateQuery({ district: localDistrict });
    }, 500);
    return () => clearTimeout(timer);
  }, [localDistrict, district, updateQuery]);

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 space-y-8">
      <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/20 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg tracking-tight">Bộ lọc nâng cao</h3>
          <Link href="/listings" className="text-xs font-bold text-secondary uppercase tracking-widest">
            Xóa tất cả
          </Link>
        </div>

        <div className="space-y-8">
          <div className="space-y-4 mb-8">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Từ khóa
            </label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
              <input 
                type="text" 
                value={localQ}
                onChange={(e) => setLocalQ(e.target.value)}
                placeholder="Tìm theo tên, địa chỉ..." 
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low border-none rounded-lg text-sm focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Filter: Type */}
          <div className="space-y-4 mb-8">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Loại bất động sản
            </label>
            <div className="space-y-2">
              {[
                { value: "", label: "Tất cả" },
                { value: "chung-cu", label: "Chung cư" },
                { value: "nha-pho", label: "Nhà phố" },
                { value: "biet-thu", label: "Biệt thự" },
                { value: "dat-nen", label: "Đất nền" },
                { value: "phong-tro", label: "Phòng trọ" },
                { value: "van-phong", label: "Văn phòng" },
                { value: "kho-xuong", label: "Kho/Xưởng" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => updateQuery({ type: item.value })}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    type === item.value
                      ? "bg-primary text-white font-bold"
                      : "hover:bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Filter: Category */}
          <div className="space-y-4 mb-8">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Danh mục
            </label>
            <div className="space-y-2">
              {[
                { value: "", label: "Tất cả" },
                { value: "sale", label: "Mua bán" },
                { value: "rent", label: "Cho thuê" },
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => updateQuery({ category: item.value })}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                    category === item.value
                      ? "bg-primary text-white font-bold"
                      : "hover:bg-surface-container-low text-on-surface-variant"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Thành phố
            </label>
            <select 
              value={city}
              onChange={(e) => updateQuery({ city: e.target.value, district: '' })}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm"
            >
              <option value="">Tất cả thành phố</option>
              {CITY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {city && (
            <div className="space-y-4 mb-8">
              <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
                Quận / Huyện
              </label>
              <input 
                type="text" 
                value={localDistrict}
                onChange={(e) => setLocalDistrict(e.target.value)}
                placeholder="VD: Quận 1, Bình Thạnh" 
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm" 
              />
            </div>
          )}

          <div className="space-y-4 mb-8">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Mức giá
            </label>
            <select
              value={price}
              onChange={(e) => updateQuery({ price: e.target.value })}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm"
            >
              {(category === 'rent' ? RENT_PRICE_OPTIONS : SALE_PRICE_OPTIONS).map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div className="space-y-4 mb-8">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Diện tích
            </label>
            <select 
              value={area}
              onChange={(e) => updateQuery({ area: e.target.value })}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm"
            >
              {AREA_OPTIONS.map((option) => <option key={option.label} value={option.value}>{option.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="space-y-4">
              <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
                Phòng ngủ
              </label>
              <select 
                value={bedrooms}
                onChange={(e) => updateQuery({ bedrooms: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm"
              >
                <option value="">Bất kỳ</option>
                <option value="1">1+ PN</option>
                <option value="2">2+ PN</option>
                <option value="3">3+ PN</option>
                <option value="4">4+ PN</option>
              </select>
            </div>
            <div className="space-y-4">
              <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
                Phòng tắm
              </label>
              <select 
                value={bathrooms}
                onChange={(e) => updateQuery({ bathrooms: e.target.value })}
                className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm"
              >
                <option value="">Bất kỳ</option>
                <option value="1">1+ WC</option>
                <option value="2">2+ WC</option>
                <option value="3">3+ WC</option>
              </select>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Hướng nhà
            </label>
            <select 
              value={direction}
              onChange={(e) => updateQuery({ direction: e.target.value })}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm"
            >
              {DIRECTION_OPTIONS.map((d) => <option key={d || 'all'} value={d}>{d || 'Tất cả hướng'}</option>)}
            </select>
          </div>

          <div className="space-y-4 mb-8">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Tiện ích
            </label>
            <select 
              value={feature}
              onChange={(e) => updateQuery({ feature: e.target.value })}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm"
            >
              {FEATURE_OPTIONS.map((f) => <option key={f || 'all'} value={f}>{f || 'Tất cả tiện ích'}</option>)}
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">
              Sắp xếp
            </label>
            <select 
              value={sort}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="w-full px-4 py-3 bg-surface-container-low border-none rounded-lg text-sm"
            >
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </div>
        </div>
      </div>
    </aside>
  );
}
