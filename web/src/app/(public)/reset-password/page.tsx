'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự.');
      return;
    }
    if (password !== confirm) {
      setError('Hai mật khẩu không khớp.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.updateUser({ password });
      if (authError) {
        setError('Link đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới.');
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
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
          <h2 className="text-2xl font-bold text-on-surface mb-2 text-center">Đặt lại mật khẩu</h2>
          <p className="text-on-surface-variant text-sm mb-6 text-center">
            Nhập mật khẩu mới cho tài khoản của bạn.
          </p>

          {done ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-primary">check_circle</span>
              </div>
              <p className="text-on-surface font-semibold">Mật khẩu đã được cập nhật!</p>
              <p className="text-sm text-on-surface-variant">Đang chuyển bạn về trang đăng nhập...</p>
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
                  <label className="block text-sm font-medium text-on-surface mb-2">Mật khẩu mới</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Tối thiểu 8 ký tự"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Nhập lại mật khẩu"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-primary-gradient text-on-primary font-bold rounded-lg shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading && <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>}
                  {loading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </form>
              <div className="mt-6 text-center text-sm text-on-surface-variant">
                <Link href="/login" className="text-primary font-semibold hover:underline">← Quay lại đăng nhập</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
