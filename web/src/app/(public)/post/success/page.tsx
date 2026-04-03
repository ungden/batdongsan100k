import Link from "next/link";

export default function PostSuccessPage() {
  return (
    <div className="pt-32 pb-20 px-4 md:px-8 max-w-3xl mx-auto text-center">
      <span
        className="material-symbols-outlined text-7xl text-secondary mb-6 block"
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        check_circle
      </span>
      <h1 className="text-4xl font-extrabold tracking-tighter text-on-surface mb-4">
        Đăng Tin Thành Công!
      </h1>
      <p className="text-lg text-on-surface-variant mb-8">
        Tin đăng của bạn đang được xem xét và sẽ được hiển thị sau khi được duyệt.
        Thời gian xét duyệt thông thường từ 1-24 giờ.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/post"
          className="bg-primary-container text-on-primary-container px-8 py-3 rounded-md font-bold hover:opacity-90 transition-all"
        >
          Đăng tin khác
        </Link>
        <Link
          href="/dashboard"
          className="bg-surface-container-high text-on-surface px-8 py-3 rounded-md font-bold hover:opacity-90 transition-all"
        >
          Quản lý tin đăng
        </Link>
      </div>
    </div>
  );
}
