"use client";

import { useState, useActionState } from "react";
import { submitPropertyAction } from "./actions";

const steps = [
  { num: "01", label: "Thông Tin Cơ Bản" },
  { num: "02", label: "Chi Tiết Bất Động Sản" },
  { num: "03", label: "Hình Ảnh & Video" },
  { num: "04", label: "Liên Hệ & Đăng Tin" },
];

export default function PostPropertyPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [category, setCategory] = useState<'sale' | 'rent'>('sale');
  const [state, formAction, isPending] = useActionState(submitPropertyAction, null);

  return (
    <div className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
      {/* Header & Progress */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-on-surface mb-6">
          Đăng Tin Bất Động Sản
        </h1>

        {/* Progress Stepper */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
          {steps.map((step, i) => (
            <button
              key={step.num}
              onClick={() => setCurrentStep(i)}
              className={`border-b-4 pb-3 text-left ${
                i === currentStep
                  ? "border-primary"
                  : "border-outline-variant/30"
              }`}
            >
              <span
                className={`block text-[10px] uppercase tracking-[0.2em] font-bold mb-1 ${
                  i === currentStep ? "text-primary" : "text-outline opacity-50"
                }`}
              >
                Bước {step.num}
              </span>
              <span
                className={`text-sm ${
                  i === currentStep
                    ? "font-bold text-on-surface"
                    : "font-medium text-outline"
                }`}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Form Layout: Two-Column Grid */}
      <form action={formAction} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Form Section */}
        <div className="lg:col-span-8 space-y-12">
          {/* Section 1: Basic Info */}
          <section className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-secondary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                info
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Thông Tin Chung</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Category selector */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Hình thức *
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCategory('sale')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                      category === 'sale'
                        ? 'bg-[#001e40] text-white'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Mua bán
                  </button>
                  <button
                    type="button"
                    onClick={() => setCategory('rent')}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all ${
                      category === 'rent'
                        ? 'bg-orange-500 text-white'
                        : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    Cho thuê
                  </button>
                </div>
                <input type="hidden" name="category" value={category} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Tiêu đề tin đăng *
                </label>
                <input
                  name="title"
                  className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 text-on-surface placeholder:text-outline transition-all"
                  placeholder="VD: Căn hộ cao cấp Vinhomes Central Park 2PN full nội thất"
                  type="text"
                  required
                  minLength={10}
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Loại bất động sản
                </label>
                <select name="type" className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 appearance-none transition-all">
                  <option value="chung-cu">Căn hộ chung cư</option>
                  <option value="nha-pho">Nhà riêng</option>
                  <option value="dat-nen">Đất nền</option>
                  <option value="biet-thu">Biệt thự</option>
                  <option value="phong-tro">Phòng trọ</option>
                  <option value="van-phong">Văn phòng</option>
                  <option value="kho-xuong">Kho / Xưởng</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  {category === 'rent' ? 'Giá thuê (triệu/tháng)' : 'Giá bán (tỷ)'}
                </label>
                <div className="relative">
                  <input
                    name="price"
                    className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 transition-all"
                    placeholder={category === 'rent' ? '10' : '5'}
                    type="number"
                    step="any"
                    min="0.01"
                    required
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 font-bold text-outline text-sm">
                    {category === 'rent' ? 'Triệu/tháng' : 'Tỷ'}
                  </span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Diện tích (m²)
                </label>
                <input
                  name="area"
                  className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 transition-all"
                  placeholder="75"
                  type="number"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Mô tả chi tiết
                </label>
                <textarea
                  name="description"
                  className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 transition-all"
                  placeholder="Mô tả các đặc điểm nổi bật, hướng nhà, tiện ích xung quanh..."
                  rows={6}
                ></textarea>
              </div>
            </div>
          </section>

          {/* Section 2: Chi tiết BĐS */}
          <section className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-secondary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                bedroom_parent
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Chi Tiết Bất Động Sản</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Số phòng ngủ
                </label>
                <select name="bedrooms" className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 appearance-none">
                  <option value="0">Không có</option>
                  <option value="1">1 phòng</option>
                  <option value="2" selected>2 phòng</option>
                  <option value="3">3 phòng</option>
                  <option value="4">4 phòng</option>
                  <option value="5">5+ phòng</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Số phòng tắm
                </label>
                <select name="bathrooms" className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 appearance-none">
                  <option value="0">Không có</option>
                  <option value="1">1 phòng</option>
                  <option value="2" selected>2 phòng</option>
                  <option value="3">3 phòng</option>
                  <option value="4">4+ phòng</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Hướng nhà
                </label>
                <select name="direction" className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 appearance-none">
                  <option value="">Không xác định</option>
                  <option value="Đông">Đông</option>
                  <option value="Tây">Tây</option>
                  <option value="Nam">Nam</option>
                  <option value="Bắc">Bắc</option>
                  <option value="Đông Bắc">Đông Bắc</option>
                  <option value="Đông Nam">Đông Nam</option>
                  <option value="Tây Bắc">Tây Bắc</option>
                  <option value="Tây Nam">Tây Nam</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 3: Hình ảnh */}
          <section className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-secondary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                add_a_photo
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Hình Ảnh</h2>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                Link hình ảnh (mỗi dòng 1 URL)
              </label>
              <textarea
                name="images"
                className="w-full bg-surface-container-low border-none focus:ring-2 focus:ring-primary rounded-lg py-4 px-6 transition-all font-mono text-sm"
                placeholder={"https://example.com/anh-1.jpg\nhttps://example.com/anh-2.jpg\nhttps://example.com/anh-3.jpg"}
                rows={5}
              ></textarea>
              <p className="text-xs text-on-surface-variant mt-2">
                Dán link ảnh trực tiếp (JPG, PNG, WEBP). Tối đa 12 ảnh. Ảnh đầu tiên sẽ làm ảnh đại diện.
              </p>
            </div>
          </section>

          {/* Section 3: Location */}
          <section className="bg-surface-container-lowest p-8 md:p-12 rounded-xl shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-outline-variant/10">
            <div className="flex items-center gap-3 mb-8">
              <span
                className="material-symbols-outlined text-secondary text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                map
              </span>
              <h2 className="text-2xl font-bold tracking-tight">Vị Trí &amp; Bản Đồ</h2>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Tỉnh / Thành phố
                  </label>
                  <select name="city" className="w-full bg-surface-container-low border-none rounded-lg py-4 px-6 appearance-none">
                    <option value="Hồ Chí Minh">TP. Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Bình Dương">Bình Dương</option>
                    <option value="Đồng Nai">Đồng Nai</option>
                    <option value="Khánh Hòa">Khánh Hòa</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                    Quận / Huyện
                  </label>
                  <input
                    name="district"
                    className="w-full bg-surface-container-low border-none rounded-lg py-4 px-6"
                    placeholder="VD: Quận 1, Bình Thạnh, Thủ Đức..."
                    type="text"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-2">
                  Địa chỉ chi tiết
                </label>
                <input
                  name="address"
                  className="w-full bg-surface-container-low border-none rounded-lg py-4 px-6"
                  placeholder="Số nhà, tên đường, phường/xã..."
                  type="text"
                />
              </div>
              {/* Map Placeholder */}
              <div className="relative w-full h-[400px] bg-surface-container rounded-2xl overflow-hidden group">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-6 rounded-xl shadow-2xl text-center max-w-xs transform group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-primary text-4xl mb-2">
                      location_on
                    </span>
                    <p className="font-bold text-on-surface">Click để chọn vị trí</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      Định vị chính xác giúp tin đăng uy tín hơn 40%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar / Preview & Info */}
        <aside className="lg:col-span-4 sticky top-32 space-y-8">
          {/* Guidelines Card */}
          <div className="bg-primary text-on-primary p-8 rounded-xl shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            <h3 className="text-xl font-bold mb-4 relative z-10">Mẹo Đăng Tin Nhanh</h3>
            <ul className="space-y-4 text-sm font-medium text-primary-fixed relative z-10">
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-secondary-fixed">
                  check_circle
                </span>
                <span>
                  Sử dụng tiêu đề có chứa từ khóa quan trọng: Quận, Giá, Diện tích.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-secondary-fixed">
                  check_circle
                </span>
                <span>
                  Tải lên ít nhất 5 tấm ảnh thực tế để thu hút người xem.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="material-symbols-outlined text-secondary-fixed">
                  check_circle
                </span>
                <span>
                  Mô tả chi tiết các tiện ích: Hồ bơi, gym, trường học, chợ...
                </span>
              </li>
            </ul>
          </div>

          {/* Error Message */}
          {state?.error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm font-medium">
              {state.error}
            </div>
          )}

          {/* Sticky Action Bar */}
          <div className="flex flex-col gap-4">
            <button
              type="button"
              className="w-full bg-primary-container text-on-primary-container py-4 rounded-md font-bold text-sm tracking-tight hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">visibility</span>
              Xem Trước Tin Đăng
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-primary text-on-primary py-4 rounded-md font-bold text-sm tracking-tight shadow-[0_20px_40px_-10px_rgba(0,30,64,0.3)] hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              <span>{isPending ? 'Đang gửi...' : 'Đăng tin ngay'}</span>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className="text-[10px] text-center text-on-surface-variant font-medium uppercase tracking-widest px-4">
              Bằng việc nhấn đăng tin, bạn đồng ý với{" "}
              <a className="text-primary underline" href="#">
                Điều khoản dịch vụ
              </a>{" "}
              của chúng tôi.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
