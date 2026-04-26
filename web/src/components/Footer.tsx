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
          <p className="text-sm text-on-surface-variant leading-relaxed mb-3">
            Nền tảng bất động sản hàng đầu Việt Nam, cung cấp giải pháp tìm kiếm và ký gửi chuyên nghiệp với hệ thống dữ liệu chính xác.
          </p>
          <p className="text-xs text-on-surface-variant/70 leading-relaxed">
            Vận hành bởi Titan Labs<br/>
            MST: 0300000000 (cập nhật khi có)
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
            <li><Link href="/about" className="text-on-surface-variant hover:text-primary text-sm">Giới thiệu</Link></li>
            <li><Link href="/contact" className="text-on-surface-variant hover:text-primary text-sm">Liên hệ</Link></li>
            <li><Link href="/terms" className="text-on-surface-variant hover:text-primary text-sm">Điều khoản sử dụng</Link></li>
            <li><Link href="/privacy" className="text-on-surface-variant hover:text-primary text-sm">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-bold text-primary mb-6 text-sm uppercase tracking-widest">Liên Hệ</h4>
          <ul className="space-y-4 text-sm text-on-surface-variant">
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">mail</span>
              <a href="mailto:alexle@titanlabs.vn" className="hover:text-primary">alexle@titanlabs.vn</a>
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">location_on</span>
              TP. Hồ Chí Minh, Việt Nam
            </li>
            <li className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px] text-secondary">flag</span>
              <a href="mailto:alexle@titanlabs.vn?subject=Báo cáo tin vi phạm" className="hover:text-primary">Báo cáo tin vi phạm</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-outline-variant/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-sm text-on-surface-variant">
          &copy; {new Date().getFullYear()} TitanHome. Bảo lưu mọi quyền.
        </p>
        <div className="flex gap-4 text-xs text-on-surface-variant">
          <Link href="/terms" className="hover:text-primary">Điều khoản</Link>
          <span>·</span>
          <Link href="/privacy" className="hover:text-primary">Bảo mật</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-primary">Liên hệ</Link>
        </div>
      </div>
    </footer>
  );
}
