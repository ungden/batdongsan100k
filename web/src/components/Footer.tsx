import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full py-12 px-4 md:px-8 mt-20 bg-surface-container-low border-t border-outline-variant/20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Company Info */}
        <div>
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
          <h4 className="font-bold text-primary mb-6 text-sm uppercase tracking-widest">Dịch Vụ</h4>
          <ul className="space-y-4">
            <li><Link href="/listings?type=chung-cu" className="text-on-surface-variant hover:text-primary text-sm">Mua Bán Căn Hộ</Link></li>
            <li><Link href="/listings?category=rent&type=van-phong" className="text-on-surface-variant hover:text-primary text-sm">Cho Thuê Văn Phòng</Link></li>
            <li><Link href="/market-overview" className="text-on-surface-variant hover:text-primary text-sm">Tổng Quan Thị Trường</Link></li>
            <li><Link href="/news" className="text-on-surface-variant hover:text-primary text-sm">Tin Tức BĐS</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="font-bold text-primary mb-6 text-sm uppercase tracking-widest">Công Ty</h4>
          <ul className="space-y-4">
            <li><Link href="/post" className="text-on-surface-variant hover:text-primary text-sm">Đăng Tin Bất Động Sản</Link></li>
            <li><Link href="/listings" className="text-on-surface-variant hover:text-primary text-sm">Tìm Kiếm BĐS</Link></li>
            <li><Link href="/login" className="text-on-surface-variant hover:text-primary text-sm">Đăng Nhập / Đăng Ký</Link></li>
            <li><Link href="/saved" className="text-on-surface-variant hover:text-primary text-sm">Tin Đã Lưu</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-primary mb-6 text-sm uppercase tracking-widest">Liên Hệ</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">mail</span>
              alexle@titanlabs.vn
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              TP. Hồ Chí Minh, Việt Nam
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-on-surface-variant">
          &copy; {new Date().getFullYear()} TitanHome. Bảo lưu mọi quyền.
        </p>
      </div>
    </footer>
  );
}
