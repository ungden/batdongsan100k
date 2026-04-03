import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full py-12 px-8 mt-20 bg-surface-container-low border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Company Info */}
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <Image src="/icon.svg" alt="TitanHome" width={28} height={28} className="w-7 h-7" />
            <span className="text-lg font-black tracking-tighter">
              <span className="text-[#001e40]">Titan</span><span className="text-[#006c47]">Home</span>
            </span>
          </Link>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Nền tảng bất động sản hàng đầu Việt Nam, cung cấp giải pháp tìm kiếm và ký gửi chuyên nghiệp với hệ thống dữ liệu chính xác.
          </p>
        </div>

        {/* Services */}
        <div>
          <h4 className="font-bold text-primary mb-6 text-sm uppercase tracking-widest">
            Dịch Vụ
          </h4>
          <ul className="space-y-4">
            <li>
              <Link
                href="/listings"
                className="text-on-surface-variant hover:text-primary underline decoration-secondary decoration-2 underline-offset-4 text-sm"
              >
                Mua Bán Căn Hộ
              </Link>
            </li>
            <li>
              <Link
                href="/listings?category=rent"
                className="text-on-surface-variant hover:text-primary text-sm"
              >
                Cho Thuê Văn Phòng
              </Link>
            </li>
            <li>
              <Link
                href="/listings?type=dat-nen"
                className="text-on-surface-variant hover:text-primary text-sm"
              >
                Đất Nền Dự Án
              </Link>
            </li>
            <li>
              <Link href="#" className="text-on-surface-variant hover:text-primary text-sm">
                Tư Vấn Pháp Lý
              </Link>
            </li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-bold text-primary mb-6 text-sm uppercase tracking-widest">
            Công Ty
          </h4>
          <ul className="space-y-4">
            <li>
              <Link href="#" className="text-on-surface-variant hover:text-primary text-sm">
                Về chúng tôi
              </Link>
            </li>
            <li>
              <Link href="#" className="text-on-surface-variant hover:text-primary text-sm">
                Liên hệ
              </Link>
            </li>
            <li>
              <Link href="#" className="text-on-surface-variant hover:text-primary text-sm">
                Điều khoản dịch vụ
              </Link>
            </li>
            <li>
              <Link href="#" className="text-on-surface-variant hover:text-primary text-sm">
                Chính sách bảo mật
              </Link>
            </li>
            <li>
              <Link href="#" className="text-on-surface-variant hover:text-primary text-sm">
                Báo cáo thị trường
              </Link>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold text-primary mb-6 text-sm uppercase tracking-widest">
            Đăng Ký Bản Tin
          </h4>
          <div className="flex flex-col gap-4">
            <input
              className="bg-surface-container-lowest border-none rounded-md px-4 py-3 text-sm focus:ring-2 focus:ring-secondary"
              placeholder="Email của bạn"
              type="email"
            />
            <button className="bg-primary text-on-primary py-3 rounded-md font-bold text-sm hover:bg-primary-container transition-all">
              Gửi ngay
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-on-surface-variant">
          &copy; 2025 TitanHome. Bảo lưu mọi quyền.
        </p>
        <div className="flex gap-6">
          <a className="text-outline hover:text-primary" href="#">
            <span className="material-symbols-outlined">social_leaderboard</span>
          </a>
          <a className="text-outline hover:text-primary" href="#">
            <span className="material-symbols-outlined">alternate_email</span>
          </a>
          <a className="text-outline hover:text-primary" href="#">
            <span className="material-symbols-outlined">share</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
