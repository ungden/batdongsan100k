import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Thông tin liên hệ TitanHome - Hỗ trợ người dùng, hợp tác kinh doanh, báo cáo tin vi phạm.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight mb-3">Liên hệ với TitanHome</h1>
        <p className="text-on-surface-variant">Chúng tôi sẵn sàng hỗ trợ bạn 24/7.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-8 rounded-2xl bg-surface-container-low">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">mail</span>
            <h2 className="text-xl font-bold">Email</h2>
          </div>
          <p className="text-on-surface-variant mb-3">Hỗ trợ chung và phản hồi nhanh nhất</p>
          <a href="mailto:alexle@titanlabs.vn" className="text-primary font-semibold hover:underline">
            alexle@titanlabs.vn
          </a>
        </div>

        <div className="p-8 rounded-2xl bg-surface-container-low">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">support_agent</span>
            <h2 className="text-xl font-bold">Báo cáo tin vi phạm</h2>
          </div>
          <p className="text-on-surface-variant mb-3">Tin lừa đảo, tin trùng, sai thông tin</p>
          <a href="mailto:alexle@titanlabs.vn?subject=Báo cáo tin vi phạm" className="text-primary font-semibold hover:underline">
            Gửi báo cáo
          </a>
        </div>

        <div className="p-8 rounded-2xl bg-surface-container-low">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">handshake</span>
            <h2 className="text-xl font-bold">Hợp tác kinh doanh</h2>
          </div>
          <p className="text-on-surface-variant mb-3">Đăng ký gói doanh nghiệp, API, đối tác chiến lược</p>
          <a href="mailto:alexle@titanlabs.vn?subject=Hợp tác kinh doanh" className="text-primary font-semibold hover:underline">
            alexle@titanlabs.vn
          </a>
        </div>

        <div className="p-8 rounded-2xl bg-surface-container-low">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-3xl text-primary">location_on</span>
            <h2 className="text-xl font-bold">Văn phòng</h2>
          </div>
          <p className="text-on-surface-variant">
            Titan Labs<br/>
            TP. Hồ Chí Minh, Việt Nam
          </p>
        </div>
      </div>

      <div className="mt-12 p-8 rounded-2xl border border-outline-variant/30 bg-surface text-center">
        <h3 className="text-lg font-bold mb-2">Giờ làm việc</h3>
        <p className="text-on-surface-variant">Thứ Hai – Thứ Bảy: 8:00 – 18:00</p>
        <p className="text-on-surface-variant">Chủ nhật: Nghỉ (email vẫn được phản hồi trong 24h)</p>
      </div>
    </div>
  );
}
