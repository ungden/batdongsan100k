import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Điều khoản sử dụng",
  description: "Điều khoản và điều kiện sử dụng dịch vụ TitanHome - Nền tảng bất động sản batdongsan100k.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 py-16 prose prose-slate prose-headings:font-extrabold prose-headings:text-on-surface prose-p:text-on-surface-variant prose-li:text-on-surface-variant">
      <h1>Điều khoản sử dụng</h1>
      <p className="text-sm text-on-surface-variant">Cập nhật lần cuối: 26/04/2026</p>

      <h2>1. Chấp nhận điều khoản</h2>
      <p>
        Bằng việc truy cập và sử dụng website TitanHome (sau đây gọi là &quot;Dịch vụ&quot;), bạn đồng ý
        tuân thủ các điều khoản dưới đây. Nếu không đồng ý, vui lòng ngừng sử dụng Dịch vụ.
      </p>

      <h2>2. Tài khoản người dùng</h2>
      <ul>
        <li>Bạn phải đủ 18 tuổi hoặc có sự đồng ý của người giám hộ hợp pháp.</li>
        <li>Thông tin đăng ký phải chính xác, đầy đủ và được cập nhật.</li>
        <li>Bạn chịu trách nhiệm bảo mật mật khẩu và mọi hoạt động trên tài khoản của mình.</li>
      </ul>

      <h2>3. Đăng tin bất động sản</h2>
      <ul>
        <li>Tin đăng phải có thật, chính xác về giá, diện tích, vị trí và pháp lý.</li>
        <li>Cấm đăng tin trùng lặp, tin ảo, tin spam hoặc nội dung vi phạm pháp luật.</li>
        <li>TitanHome có quyền gỡ bỏ, ẩn hoặc khóa tin đăng vi phạm mà không cần báo trước.</li>
        <li>Người đăng tin chịu trách nhiệm pháp lý về nội dung tin của mình.</li>
      </ul>

      <h2>4. Gói dịch vụ trả phí (VIP)</h2>
      <ul>
        <li>Phí dịch vụ được công khai trên website và có thể thay đổi theo thông báo.</li>
        <li>Sau khi thanh toán thành công, gói dịch vụ sẽ được kích hoạt tự động.</li>
        <li>Phí đã thanh toán không hoàn lại trừ trường hợp lỗi kỹ thuật từ TitanHome.</li>
      </ul>

      <h2>5. Quyền sở hữu trí tuệ</h2>
      <p>
        Toàn bộ nội dung, giao diện, logo và mã nguồn của TitanHome thuộc quyền sở hữu của chúng tôi.
        Mọi hành vi sao chép, phân phối khi chưa được phép đều bị nghiêm cấm.
      </p>

      <h2>6. Giới hạn trách nhiệm</h2>
      <p>
        TitanHome là nền tảng kết nối, không phải bên môi giới hay trung gian giao dịch. Mọi giao dịch
        bất động sản giữa người mua, người bán, người thuê được thực hiện trực tiếp giữa các bên.
        TitanHome không chịu trách nhiệm cho các tranh chấp phát sinh.
      </p>

      <h2>7. Thay đổi điều khoản</h2>
      <p>
        Chúng tôi có quyền cập nhật điều khoản này bất cứ lúc nào. Thay đổi sẽ có hiệu lực ngay khi
        đăng tải. Việc tiếp tục sử dụng Dịch vụ sau khi cập nhật đồng nghĩa bạn chấp nhận thay đổi.
      </p>

      <h2>8. Liên hệ</h2>
      <p>
        Mọi thắc mắc về Điều khoản, vui lòng liên hệ <a href="mailto:alexle@titanlabs.vn">alexle@titanlabs.vn</a>.
      </p>
    </article>
  );
}
