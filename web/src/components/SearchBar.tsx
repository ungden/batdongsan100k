"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CITIES = [
  "Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Bình Dương",
  "Đồng Nai",
  "Khánh Hòa",
  "Hải Phòng",
  "Cần Thơ",
  "Bà Rịa Vũng Tàu",
  "Long An",
];

const CATEGORIES = [
  { value: "sale", label: "Mua bán" },
  { value: "rent", label: "Cho thuê" },
];

const TYPES = [
  { value: "", label: "Tất cả loại" },
  { value: "chung-cu", label: "Căn hộ / Chung cư" },
  { value: "nha-pho", label: "Nhà phố" },
  { value: "biet-thu", label: "Biệt thự" },
  { value: "dat-nen", label: "Đất nền" },
  { value: "phong-tro", label: "Phòng trọ" },
  { value: "van-phong", label: "Văn phòng" },
];

const PRICE_RANGES = [
  { value: "", label: "Tất cả mức giá" },
  { value: "0-2000000000", label: "Dưới 2 tỷ" },
  { value: "2000000000-5000000000", label: "2 - 5 tỷ" },
  { value: "5000000000-10000000000", label: "5 - 10 tỷ" },
  { value: "10000000000-999999999999", label: "Trên 10 tỷ" },
];

export default function SearchBar() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("sale");
  const [type, setType] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    if (type) params.set("type", type);
    if (priceRange) params.set("price", priceRange);
    router.push(`/listings?${params.toString()}`);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] p-3 max-w-4xl w-full">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Location - PRIMARY FIELD (large) */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-secondary text-xl">
            location_on
          </span>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-[#f3f3f4] border-none rounded-xl text-on-surface font-semibold text-base focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
          >
            <option value="">Chọn khu vực bạn quan tâm...</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
            expand_more
          </span>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-3 gap-2">
          {/* Category */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-[#f3f3f4] border-none rounded-xl text-on-surface text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div className="relative">
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-3 bg-[#f3f3f4] border-none rounded-xl text-on-surface text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Price */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full px-4 py-3 bg-[#f3f3f4] border-none rounded-xl text-on-surface text-sm font-medium focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
            >
              {PRICE_RANGES.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#001e40] to-[#003366] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-[0.99] text-base"
        >
          <span className="material-symbols-outlined">search</span>
          Tìm kiếm bất động sản
        </button>
      </form>

      {/* Quick location chips */}
      <div className="flex flex-wrap gap-2 mt-3 px-1">
        {["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương"].map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCity(c);
              router.push(`/listings?city=${encodeURIComponent(c)}&category=sale`);
            }}
            className="text-xs font-medium text-on-surface-variant bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-outline-variant/30 transition-colors"
          >
            <span className="material-symbols-outlined text-xs align-middle mr-1">location_on</span>
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
