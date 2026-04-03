export const dynamic = "force-dynamic";

import Link from "next/link";
import Image from "next/image";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import {
  getVipProperties,
  getRentProperties,
  getPropertiesByType,
  getPropertiesCount,
  getAgentsCount,
  getPublishedProperties,
  getProjectSummaries,
} from "@/lib/queries/properties";
import { getPublishedPosts } from "@/lib/queries/posts";

const cities = [
  { name: "TP. Hồ Chí Minh", slug: "ho-chi-minh", gradient: "from-rose-500 to-orange-400" },
  { name: "Hà Nội", slug: "ha-noi", gradient: "from-blue-600 to-cyan-400" },
  { name: "Đà Nẵng", slug: "da-nang", gradient: "from-teal-500 to-emerald-400" },
  { name: "Bình Dương", slug: "binh-duong", gradient: "from-purple-500 to-pink-400" },
  { name: "Đồng Nai", slug: "dong-nai", gradient: "from-amber-500 to-yellow-400" },
  { name: "Khánh Hòa", slug: "khanh-hoa", gradient: "from-sky-500 to-blue-400" },
  { name: "Hải Phòng", slug: "hai-phong", gradient: "from-indigo-500 to-violet-400" },
  { name: "Cần Thơ", slug: "can-tho", gradient: "from-green-500 to-lime-400" },
];

export default async function HomePage() {
  const [
    vipProperties,
    saleLatestResult,
    rentLatestResult,
    rentHot,
    chungCuProperties,
    nhaPhoProperties,
    datNenProperties,
    projectSummaries,
    propertiesCount,
    agentsCount,
    posts,
  ] = await Promise.all([
    getVipProperties(6),
    getPublishedProperties({ category: "sale" }, 8),
    getPublishedProperties({ category: "rent" }, 8),
    getRentProperties(4),
    getPropertiesByType("chung-cu", 4),
    getPropertiesByType("nha-pho", 4),
    getPropertiesByType("dat-nen", 4),
    getProjectSummaries(4),
    getPropertiesCount(),
    getAgentsCount(),
    getPublishedPosts(3),
  ]);

  const saleLatest = saleLatestResult.properties;
  const rentLatest = rentLatestResult.properties;

  return (
    <>
      {/* ====== HERO + SEARCH ====== */}
      <header className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            width={800}
            height={600}
            className="w-full h-full object-cover brightness-[0.8]"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZARNu-Z18UL0UEoqJbP-cVCB82rsK10RSggP6zPbNFCodm1Ig_pKHVEq99BPtUIeKLeq1ggFgl9m7_k3J-NsVbuEjkTetcM29z7mlCO8Wna-zjEuClrEkj7lupAAS4AmglP1CDLS5TSOtK_mxnuXvnF9HlSh5qHsp3HRTcUl27IwN4h4sGz84iELzTShEvtGBj9aa4O7fpK9ETl2GlJ4pINs3wHkl0SYp_5tnlSebBT8EYPM65S9K6VKkvMEc9jiUzE8Bhr57IvY"
            alt="Modern high-rise luxury apartment building"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 py-20 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-headline -tracking-[0.02em] leading-tight mb-6">
              Kiến tạo không gian <br /> Sống đẳng cấp.
            </h1>
            <p className="text-xl text-white/90 font-light mb-12 max-w-xl">
              Khám phá những bất động sản được tuyển chọn kỹ lưỡng, mang đến
              trải nghiệm sống thượng lưu tại Việt Nam.
            </p>
          </div>
          <SearchBar />
        </div>
      </header>

      {/* ====== QUICK NAV TABS ====== */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-0">
          <a
            href="#mua-ban"
            className="flex items-center gap-2 px-6 py-4 font-bold text-[#001e40] border-b-4 border-[#001e40] hover:bg-slate-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">home</span>
            Mua bán
          </a>
          <a
            href="#cho-thue"
            className="flex items-center gap-2 px-6 py-4 font-bold text-[#ea580c] border-b-4 border-[#ea580c] hover:bg-orange-50 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">key</span>
            Cho thuê
          </a>
        </div>
      </section>

      {/* ============================================================ */}
      {/* ====== MUA BÁN MEGA-SECTION (navy theme) =================== */}
      {/* ============================================================ */}
      <div id="mua-ban">
        {/* --- VIP Sale --- */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#001e40] mb-2 block">
                  MUA BÁN
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2">
                  <span>🏠</span> Bất Động Sản Mua Bán
                </h2>
                <div className="w-20 h-1 bg-[#001e40] mt-2 rounded-full"></div>
              </div>
              <Link
                href="/listings?category=sale"
                className="text-[#001e40] font-semibold flex items-center gap-1 hover:gap-2 transition-all text-sm"
              >
                Xem tất cả{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* VIP Cards */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#001e40] mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                Tin VIP
              </h3>
            </div>
            {vipProperties.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {vipProperties.map((property, index) => (
                  <PropertyCard key={property.id} property={property} isVip priority={index < 4} />
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-center py-8">
                Chưa có tin VIP nào.
              </p>
            )}
          </div>
        </section>

        {/* --- Sale Latest --- */}
        <section className="py-16 bg-[#f8fafc]">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#001e40]"></span>
                  Mới đăng bán
                </h3>
                <div className="w-16 h-1 bg-[#001e40]/30 mt-2 rounded-full"></div>
              </div>
              <Link
                href="/listings?category=sale&sort=newest"
                className="text-[#001e40] font-semibold flex items-center gap-1 hover:gap-2 transition-all text-sm"
              >
                Xem tất cả{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
            {saleLatest.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {saleLatest.map((property, index) => (
                  <PropertyCard key={property.id} property={property} priority={index < 4} />
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-center py-8">
                Chưa có tin mua bán mới.
              </p>
            )}
          </div>
        </section>

        {/* --- Sale By Type --- */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#001e40]"></span>
                Theo loại hình
              </h3>
              <div className="w-16 h-1 bg-[#001e40]/30 mt-2 rounded-full"></div>
            </div>

            {/* Type Tabs */}
            <div className="flex gap-3 mb-8">
              <Link
                href="/listings?category=sale&type=chung-cu"
                className="px-5 py-2 rounded-full bg-[#001e40] text-white text-sm font-semibold hover:bg-[#002d5e] transition-colors"
              >
                Chung cư
              </Link>
              <Link
                href="/listings?category=sale&type=nha-pho"
                className="px-5 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Nhà phố
              </Link>
              <Link
                href="/listings?category=sale&type=dat-nen"
                className="px-5 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Đất nền
              </Link>
            </div>

            {/* Chung Cu */}
            {chungCuProperties.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-on-surface">🏢 Chung cư / Căn hộ</h4>
                  <Link
                    href="/listings?type=chung-cu"
                    className="text-sm text-[#001e40] font-medium hover:underline"
                  >
                    Xem thêm →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {chungCuProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} priority={index < 4} />
                  ))}
                </div>
              </div>
            )}

            {/* Nha Pho */}
            {nhaPhoProperties.length > 0 && (
              <div className="mb-10">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-on-surface">🏠 Nhà phố</h4>
                  <Link
                    href="/listings?type=nha-pho"
                    className="text-sm text-[#001e40] font-medium hover:underline"
                  >
                    Xem thêm →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {nhaPhoProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} priority={index < 4} />
                  ))}
                </div>
              </div>
            )}

            {/* Dat Nen */}
            {datNenProperties.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-on-surface">🗺️ Đất nền</h4>
                  <Link
                    href="/listings?type=dat-nen"
                    className="text-sm text-[#001e40] font-medium hover:underline"
                  >
                    Xem thêm →
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {datNenProperties.map((property, index) => (
                    <PropertyCard key={property.id} property={property} priority={index < 4} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="py-16 bg-[#f8fafc] border-y border-outline-variant/20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#006c47] mb-2 block">
                Dự án
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2">
                <span>🏗️</span> Dự Án Nổi Bật
              </h2>
              <div className="w-20 h-1 bg-[#006c47] mt-2 rounded-full"></div>
            </div>
            <Link
              href="/projects"
              className="text-[#006c47] font-semibold flex items-center gap-1 hover:gap-2 transition-all text-sm"
            >
              Xem tất cả
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>

          {projectSummaries.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {projectSummaries.map((project) => (
                <Link
                  key={project.slug}
                  href={`/projects/${project.slug}`}
                  className="group block rounded-2xl bg-white border border-outline-variant/20 p-6 hover:shadow-xl transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider mb-3">
                        Dự án
                      </div>
                      <h3 className="text-lg font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                        {project.name}
                      </h3>
                      <p className="text-on-surface-variant mt-2 text-sm line-clamp-2">
                        {project.propertyCount} sản phẩm • {project.district}, {project.city}
                      </p>
                      <p className="text-primary font-bold mt-4">Giá từ {project.minPriceFormatted}</p>
                    </div>
                    <span className="material-symbols-outlined text-primary shrink-0">arrow_forward</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant text-center py-8">Chưa có dự án nổi bật nào.</p>
          )}
        </div>
      </section>

      {/* ============================================================ */}
      {/* ====== CHO THUÊ MEGA-SECTION (orange/warm theme) =========== */}
      {/* ============================================================ */}
      <div id="cho-thue">
        {/* --- Rent Hot --- */}
        <section className="py-16 bg-[#fff7ed]">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#ea580c] mb-2 block">
                  CHO THUÊ
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2">
                  <span>🔑</span> Bất Động Sản Cho Thuê
                </h2>
                <div className="w-20 h-1 bg-[#ea580c] mt-2 rounded-full"></div>
              </div>
              <Link
                href="/listings?category=rent"
                className="text-[#ea580c] font-semibold flex items-center gap-1 hover:gap-2 transition-all text-sm"
              >
                Xem tất cả{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>

            {/* Rent Hot Cards */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#ea580c] mb-4 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-[#ea580c]"></span>
                Phòng trọ hot
              </h3>
            </div>
            {rentHot.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rentHot.map((property, index) => (
                  <PropertyCard key={property.id} property={property} priority={index < 4} />
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-center py-8">
                Chưa có tin cho thuê hot.
              </p>
            )}
          </div>
        </section>

        {/* --- Rent Latest --- */}
        <section className="py-16 bg-[#fffbf5]">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-bold text-on-surface flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#ea580c]"></span>
                  Cho thuê mới nhất
                </h3>
                <div className="w-16 h-1 bg-[#ea580c]/30 mt-2 rounded-full"></div>
              </div>
              <Link
                href="/listings?category=rent&sort=newest"
                className="text-[#ea580c] font-semibold flex items-center gap-1 hover:gap-2 transition-all text-sm"
              >
                Xem tất cả{" "}
                <span className="material-symbols-outlined text-sm">
                  arrow_forward
                </span>
              </Link>
            </div>
            {rentLatest.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rentLatest.map((property, index) => (
                  <PropertyCard key={property.id} property={property} priority={index < 4} />
                ))}
              </div>
            ) : (
              <p className="text-on-surface-variant text-center py-8">
                Chưa có tin cho thuê mới.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* ====== LOCATION SECTION ====== */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-2">
              <span>📍</span> Tìm theo khu vực
            </h2>
            <div className="w-16 h-1 bg-primary mt-2 rounded-full"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/listings?city=${city.slug}`}
                className={`relative overflow-hidden rounded-xl p-6 bg-gradient-to-br ${city.gradient} text-white group hover:shadow-lg transition-shadow`}
              >
                <div className="relative z-10">
                  <h3 className="text-lg font-bold mb-1">{city.name}</h3>
                  <p className="text-white/80 text-sm">Xem bất động sản →</p>
                </div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500"></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== STATISTICS ====== */}
      <section className="py-16 bg-primary-gradient">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline text-white mb-4">
              Con Số Ấn Tượng
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">
              Nền tảng bất động sản hàng đầu được tin dùng bởi hàng triệu người
              Việt Nam
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {propertiesCount.toLocaleString("vi-VN")}+
              </div>
              <div className="text-white/70 text-sm">Tin đăng BĐS</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                {agentsCount.toLocaleString("vi-VN")}+
              </div>
              <div className="text-white/70 text-sm">Môi giới uy tín</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                63
              </div>
              <div className="text-white/70 text-sm">Tỉnh thành</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                5M+
              </div>
              <div className="text-white/70 text-sm">Lượt truy cập / tháng</div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-gradient z-0"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-white max-w-2xl">
            <h2 className="text-4xl font-bold font-headline mb-6">
              Bạn muốn đăng tin bán hoặc cho thuê bất động sản?
            </h2>
            <p className="text-xl text-primary-fixed-dim font-light">
              Tiếp cận hơn 5 triệu người dùng hàng tháng và các nhà đầu tư tiềm
              năng nhất tại Việt Nam.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/post"
              className="bg-secondary text-white px-10 py-4 rounded-lg font-bold shadow-xl hover:bg-on-secondary-container transition-colors"
            >
              Đăng Tin Ngay
            </Link>
            <button className="bg-white/10 text-white px-10 py-4 rounded-lg font-bold backdrop-blur-md hover:bg-white/20 transition-colors">
              Liên Hệ Hỗ Trợ
            </button>
          </div>
        </div>
      </section>

      {/* ====== NEWS ====== */}
      <section className="py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-8">
          <div className="mb-12">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-secondary mb-3 block">
              Tin Tức &amp; Thị Trường
            </span>
            <h2 className="text-4xl font-bold font-headline text-on-surface">
              Cập Nhật Xu Hướng Bất Động Sản
            </h2>
          </div>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {/* Main Article */}
              {posts[0] && (
                <Link
                  href={`/news/${posts[0].slug}`}
                  className="md:col-span-2 group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-lg mb-6">
                    <Image
                      width={800}
                      height={600}
                      className="w-full aspect-[2/1] object-cover group-hover:scale-105 transition-transform duration-500"
                      src={
                        posts[0].coverImage ||
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuAtuX8KZZeZRlxsJRQeoBR0JnrPXvCg9JPjuvBOXEAkHo23Zx-ZdG6LK2jg_i0jgxebGis0KpMahqIb-4MjToHLewV9QIdM3eLiO-42vxWsWOxc3E0UcAQE_lLC8XvZmiTHXtBaHoPvE8A9wPgkgFv7hBAnmIZJ4TAEC-3LCisyHuK-wQCV-UWaWye8F2lukW72wwQDghVglUIxa_mtVY0eS-_uJ8WuX2YUjxu3pEIRfiDXvTJA6GaF9hPAEaLnk-lgk_Jw-hpDDX0"
                      }
                      alt={posts[0].title}
                    />
                  </div>
                  <span className="text-secondary font-bold text-xs uppercase tracking-widest mb-2 block">
                    Thị Trường
                  </span>
                  <h3 className="text-2xl font-bold text-on-surface mb-3">
                    {posts[0].title}
                  </h3>
                  <p className="text-on-surface-variant line-clamp-2">
                    {posts[0].excerpt}
                  </p>
                </Link>
              )}

              {/* Side Articles */}
              {posts.slice(1, 3).map((post) => (
                <Link
                  key={post.id}
                  href={`/news/${post.slug}`}
                  className="group cursor-pointer"
                >
                  <div className="overflow-hidden rounded-lg mb-4">
                    <Image
                      width={800}
                      height={600}
                      className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                      src={
                        post.coverImage ||
                        "https://lh3.googleusercontent.com/aida-public/AB6AXuARayir2llDljVk62ShKZP3Jd-yypn8IX_Ve0EpWtQWrEhhT1ZV7URFJ3D26gtMJVcYL30srFmEg210bayA9Cl6PAuhy8rRZsdBq90EZIgOhWdFvorXJ6FVPEiTWS9OSkLzsMFPfdPw-sfJunRkJ-nccvqSEmhXPi4ftTn30Ub7OBQAii4R9jW-JAA-y6cL_N4743N1CXr4cPybcgdB1xQb0AtghAgL5O-9wMRAA4d70VovSlyti8-mxbaxP0cCgwF8G-WMs2IjIn0"
                      }
                      alt={post.title}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-on-surface">
                    {post.title}
                  </h3>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-on-surface-variant text-center py-8">
              Chưa có bài viết nào.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
