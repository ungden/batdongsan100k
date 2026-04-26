import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "TitanHome - Nền tảng bất động sản hàng đầu Việt Nam, kết nối người mua, người bán và người thuê với hơn 50,000+ tin đăng cập nhật mỗi ngày.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <article className="max-w-4xl mx-auto px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-black tracking-tighter mb-4">
          <span className="text-[#001e40]">Titan</span><span className="text-[#006c47]">Home</span>
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
          Nền tảng bất động sản dữ liệu lớn — minh bạch giá, đa nguồn tin, ưu tiên trải nghiệm người dùng.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 rounded-2xl bg-surface-container-low text-center">
          <div className="text-4xl font-black text-primary mb-2">50,000+</div>
          <div className="text-sm text-on-surface-variant">Tin đăng đang hiển thị</div>
        </div>
        <div className="p-6 rounded-2xl bg-surface-container-low text-center">
          <div className="text-4xl font-black text-primary mb-2">63</div>
          <div className="text-sm text-on-surface-variant">Tỉnh thành phủ sóng</div>
        </div>
        <div className="p-6 rounded-2xl bg-surface-container-low text-center">
          <div className="text-4xl font-black text-primary mb-2">24/7</div>
          <div className="text-sm text-on-surface-variant">Cập nhật dữ liệu mới</div>
        </div>
      </section>

      <section className="prose prose-slate max-w-none prose-p:text-on-surface-variant">
        <h2>Sứ mệnh</h2>
        <p>
          TitanHome ra đời với mong muốn xây dựng một thị trường bất động sản Việt Nam <strong>minh bạch hơn,
          dữ liệu hơn và ít trung gian hơn</strong>. Chúng tôi tổng hợp tin đăng từ nhiều nguồn uy tín, kết hợp
          với đăng tin trực tiếp từ chính chủ và môi giới, giúp bạn có cái nhìn tổng thể về thị trường.
        </p>

        <h2>Điểm khác biệt</h2>
        <ul>
          <li><strong>AI cảnh báo giá bất thường:</strong> Phát hiện các tin có giá quá thấp hoặc quá cao so với mặt bằng khu vực.</li>
          <li><strong>So sánh tin trực quan:</strong> Lưu nhiều tin và đối chiếu cùng lúc theo các tiêu chí.</li>
          <li><strong>Bản đồ tích hợp:</strong> Xem vị trí thực tế, tìm tin theo phạm vi địa lý.</li>
          <li><strong>Dữ liệu cập nhật mỗi ngày:</strong> Crawler tự động đồng bộ tin từ các nguồn lớn.</li>
        </ul>

        <h2>Đội ngũ</h2>
        <p>
          TitanHome được vận hành bởi <strong>Titan Labs</strong> — một nhóm kỹ sư và nhà phân tích dữ liệu
          với nhiều năm kinh nghiệm trong lĩnh vực fintech và proptech tại Việt Nam.
        </p>
      </section>

      <div className="mt-12 text-center">
        <Link href="/contact" className="inline-block px-8 py-3 bg-primary text-white rounded-full font-bold shadow-md hover:-translate-y-1 transition-transform">
          Liên hệ với chúng tôi
        </Link>
      </div>
    </article>
  );
}
