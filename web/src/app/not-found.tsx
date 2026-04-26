import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-primary mb-4">404</div>
        <h1 className="text-3xl font-extrabold text-on-surface mb-3">Không tìm thấy trang</h1>
        <p className="text-on-surface-variant mb-8">
          Trang bạn tìm có thể đã được di chuyển hoặc tin đăng đã bị gỡ. Hãy thử tìm bất động sản khác.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/" className="px-6 py-3 bg-primary text-white rounded-full font-bold shadow-md hover:-translate-y-1 transition-transform">
            Về trang chủ
          </Link>
          <Link href="/listings" className="px-6 py-3 bg-surface-container border border-outline-variant rounded-full font-bold hover:bg-surface-container-high transition-colors">
            Khám phá tin đăng
          </Link>
        </div>
      </div>
    </div>
  );
}
