'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (authError) {
        setError('Không gửi được email. Vui lòng kiểm tra email và thử lại.');
        return;
      }
      setSent(true);
    } catch {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-surface px-4 pt-24">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-outline-variant/20">
          <h2 className="text-2xl font-bold text-on-surface mb-2 text-center">Quên mật khẩu?</h2>
          <p className="text-on-surface-variant text-sm mb-6 text-center">
            Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">mark_email_read</span>
              </div>
              <p className="text-on-surface">
                Đã gửi link đặt lại mật khẩu tới <strong>{email}</strong>.
              </p>
              <p className="text-sm text-on-surface-variant">
                Kiểm tra hộp thư (kể cả thư rác) và làm theo hướng dẫn.
              </p>
              <Link href="/login" className="inline-block px-6 py-2 text-primary font-semibold hover:underline">
                ← Quay lại đăng nhập
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 bg-error-container text-on-error-container border border-error/20 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    placeholder="email@example.com"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-gradient text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                  {loading ? 'Đang gửi...' : 'Gửi link đặt lại mật khẩu'}
                </button>
              </form>
              <div className="mt-6 text-center text-sm text-on-surface-variant">
                Nhớ mật khẩu rồi? <Link href="/login" className="text-primary font-semibold hover:underline">Đăng nhập</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
