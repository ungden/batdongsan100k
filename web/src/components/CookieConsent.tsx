'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'th_cookie_consent';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) setShow(true);
  }, []);

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, 'accepted');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
      <div className="max-w-4xl mx-auto bg-surface-container-high border border-outline-variant/30 rounded-2xl shadow-2xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4 pointer-events-auto">
        <div className="flex items-start gap-3 flex-1">
          <span className="material-symbols-outlined text-2xl text-primary flex-shrink-0">cookie</span>
          <p className="text-sm text-on-surface leading-relaxed">
            TitanHome sử dụng cookie để duy trì phiên đăng nhập, ghi nhớ tin yêu thích và phân tích lưu lượng,
            giúp cải thiện trải nghiệm. Xem thêm tại{' '}
            <Link href="/privacy" className="text-primary font-semibold hover:underline">Chính sách bảo mật</Link>.
          </p>
        </div>
        <button
          onClick={accept}
          className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:-translate-y-0.5 transition-transform whitespace-nowrap"
        >
          Đồng ý
        </button>
      </div>
    </div>
  );
}
