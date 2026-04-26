'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-5xl text-error">error</span>
        </div>
        <h1 className="text-3xl font-extrabold text-on-surface mb-3">Có lỗi xảy ra</h1>
        <p className="text-on-surface-variant mb-2">
          Hệ thống gặp sự cố tạm thời. Vui lòng thử lại hoặc quay về trang chủ.
        </p>
        {error.digest && (
          <p className="text-xs text-on-surface-variant/60 mb-6 font-mono">Mã lỗi: {error.digest}</p>
        )}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="px-6 py-3 bg-primary text-white rounded-full font-bold shadow-md hover:-translate-y-1 transition-transform"
          >
            Thử lại
          </button>
          <Link href="/" className="px-6 py-3 bg-surface-container border border-outline-variant rounded-full font-bold hover:bg-surface-container-high transition-colors">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
