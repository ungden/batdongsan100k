import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chính sách bảo mật",
  description: "Chính sách bảo mật và bảo vệ thông tin cá nhân của TitanHome.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16 prose prose-slate prose-headings:font-extrabold prose-headings:text-on-surface prose-p:text-on-surface-variant prose-li:text-on-surface-variant">
      <h1>Chính sách bảo mật</h1>
      <p className="text-sm text-on-surface-variant">Cập nhật lần cuối: 26/04/2026</p>

      <h2>1. Thông tin chúng tôi thu thập</h2>
      <ul>
        <li><strong>Thông tin tài khoản:</strong> họ tên, email, số điện thoại khi bạn đăng ký.</li>
        <li><strong>Thông tin tin đăng:</strong> nội dung, hình ảnh, vị trí bất động sản bạn đăng tải.</li>
        <li><strong>Thông tin sử dụng:</strong> địa chỉ IP, loại trình duyệt, trang đã xem (qua cookie).</li>
        <li><strong>Thông tin thanh toán:</strong> mã đơn hàng, không lưu trữ số tài khoản hay thẻ.</li>
      </ul>

      <h2>2. Mục đích sử dụng</h2>
      <ul>
        <li>Cung cấp, vận hành và cải thiện Dịch vụ.</li>
        <li>Xác thực người dùng và bảo vệ tài khoản.</li>
        <li>Gửi thông báo về tin đăng, giao dịch và cập nhật dịch vụ.</li>
        <li>Phân tích thống kê để tối ưu trải nghiệm.</li>
      </ul>

      <h2>3. Chia sẻ thông tin</h2>
      <p>Chúng tôi <strong>không bán</strong> thông tin cá nhân của bạn cho bên thứ ba. Chúng tôi chỉ chia sẻ thông tin trong các trường hợp:</p>
      <ul>
        <li>Khi bạn chủ động liên hệ chủ tin đăng (số điện thoại, email).</li>
        <li>Với nhà cung cấp dịch vụ kỹ thuật (Supabase, Vercel, SePay) để vận hành.</li>
        <li>Khi pháp luật yêu cầu hoặc để bảo vệ quyền lợi hợp pháp của TitanHome.</li>
      </ul>

      <h2>4. Cookie</h2>
      <p>
        Chúng tôi sử dụng cookie để duy trì phiên đăng nhập, lưu tin yêu thích và phân tích lưu lượng.
        Bạn có thể tắt cookie trong cài đặt trình duyệt nhưng một số tính năng có thể không hoạt động.
      </p>

      <h2>5. Bảo mật dữ liệu</h2>
      <p>
        Dữ liệu được mã hóa khi truyền (HTTPS) và lưu trữ trên hạ tầng Supabase đạt chuẩn SOC 2.
        Mật khẩu được hash bằng thuật toán an toàn (bcrypt). Tuy vậy không hệ thống nào tuyệt đối an toàn —
        bạn có trách nhiệm bảo mật mật khẩu của mình.
      </p>

      <h2>6. Quyền của bạn</h2>
      <ul>
        <li>Truy cập, chỉnh sửa hoặc xóa thông tin cá nhân trong tài khoản.</li>
        <li>Yêu cầu xóa toàn bộ dữ liệu (kèm xóa tài khoản) qua email <a href="mailto:alexle@titanlabs.vn">alexle@titanlabs.vn</a>.</li>
        <li>Hủy đăng ký nhận email marketing bất kỳ lúc nào.</li>
      </ul>

      <h2>7. Thay đổi chính sách</h2>
      <p>
        Chính sách này có thể được cập nhật. Phiên bản mới sẽ được đăng tải tại trang này kèm ngày cập nhật.
      </p>

      <h2>8. Liên hệ</h2>
      <p>
        Mọi thắc mắc về dữ liệu cá nhân, vui lòng liên hệ: <a href="mailto:alexle@titanlabs.vn">alexle@titanlabs.vn</a>.
      </p>
    </article>
  );
}
