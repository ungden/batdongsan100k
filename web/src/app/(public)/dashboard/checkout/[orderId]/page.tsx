'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function CheckoutPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    let subscription: any;
    
    async function loadOrder() {
      try {
        const supabase = createClient();
        
        // Fetch order details
        const { data, error: fetchError } = await supabase
          .from('payment_orders')
          .select('*, listings(title)')
          .eq('id', params.orderId)
          .single();

        if (fetchError || !data) {
          throw new Error('Không tìm thấy đơn hàng.');
        }

        setOrder(data);

        if (data.status === 'paid') {
          return; // already paid
        }

        // Subscribe to real-time status changes
        subscription = supabase
          .channel(`public:payment_orders:id=eq.${params.orderId}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'payment_orders',
              filter: `id=eq.${params.orderId}`,
            },
            (payload) => {
              if (payload.new.status === 'paid') {
                setOrder((prev: any) => ({ ...prev, status: 'paid' }));
              }
            }
          )
          .subscribe();

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [params.orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface px-4">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h1 className="text-2xl font-bold text-on-surface mb-2">Lỗi đơn hàng</h1>
        <p className="text-on-surface-variant mb-6">{error || 'Đơn hàng không khả dụng'}</p>
        <Link href="/dashboard" className="px-6 py-2 bg-primary text-white rounded-lg font-bold">
          Quay lại Quản lý tin
        </Link>
      </div>
    );
  }

  if (order.status === 'paid') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center bg-surface px-4">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <h1 className="text-3xl font-extrabold text-on-surface mb-2">Thanh toán thành công!</h1>
        <p className="text-on-surface-variant mb-8 text-center max-w-md">
          Gói <strong className="text-on-surface">{order.plan}</strong> cho tin đăng <strong>{order.listings?.title}</strong> đã được kích hoạt.
        </p>
        <Link href="/dashboard" className="px-8 py-3 bg-primary text-white rounded-lg font-bold shadow-md hover:-translate-y-1 transition-transform">
          Quay lại Bảng điều khiển
        </Link>
      </div>
    );
  }

  const bankName = process.env.NEXT_PUBLIC_SEPAY_BANK || 'MBBank';
  const bankAcc = process.env.NEXT_PUBLIC_SEPAY_ACC || '0987654321';
  
  // SePay VietQR generation
  const qrUrl = `https://qr.sepay.vn/img?acc=${bankAcc}&bank=${bankName}&amount=${order.amount}&des=${order.order_code}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-24 sm:px-6 lg:px-8 bg-surface min-h-screen">
      <Link href="/dashboard" className="text-primary font-medium hover:underline flex items-center gap-1 mb-6">
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Hủy thanh toán
      </Link>

      <div className="bg-white rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Order Info */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-outline-variant/20 bg-surface-container-lowest">
          <h1 className="text-2xl font-extrabold text-on-surface mb-6">Chi tiết đơn hàng</h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between pb-4 border-b border-dashed border-outline-variant/30">
              <span className="text-on-surface-variant">Mã đơn:</span>
              <span className="font-bold text-on-surface">{order.order_code}</span>
            </div>
            <div className="flex justify-between pb-4 border-b border-dashed border-outline-variant/30">
              <span className="text-on-surface-variant">Gói dịch vụ:</span>
              <span className="font-bold text-on-surface">{order.plan}</span>
            </div>
            <div className="flex justify-between pb-4 border-b border-dashed border-outline-variant/30">
              <span className="text-on-surface-variant">Tin đăng:</span>
              <span className="font-bold text-on-surface line-clamp-1 max-w-[200px]" title={order.listings?.title}>
                {order.listings?.title || 'Đang tải...'}
              </span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-on-surface-variant text-lg">Tổng thanh toán:</span>
              <span className="font-black text-primary text-2xl">
                {order.amount.toLocaleString('vi-VN')} VNĐ
              </span>
            </div>
          </div>

          <div className="bg-secondary-container/30 p-4 rounded-xl flex gap-3 text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-secondary">info</span>
            <p>Hệ thống tự động duyệt đơn hàng sau khi nhận được khoản chuyển khoản trong vòng 1-3 phút.</p>
          </div>
        </div>

        {/* Right Side: QR Code & Transfer Details */}
        <div className="flex-1 p-8 bg-white flex flex-col items-center justify-center text-center">
          <h2 className="text-xl font-bold text-on-surface mb-2">Quét mã QR để thanh toán</h2>
          <p className="text-sm text-on-surface-variant mb-6">Mở ứng dụng ngân hàng và quét mã dưới đây</p>

          <div className="relative w-64 h-64 border-4 border-primary rounded-xl overflow-hidden shadow-lg mb-6">
            <Image 
              src={qrUrl} 
              alt="Mã QR Thanh Toán" 
              fill
              className="object-contain p-2"
              unoptimized
            />
          </div>

          <div className="w-full text-left bg-surface-container p-4 rounded-xl text-sm">
            <p className="mb-2"><span className="text-on-surface-variant">Ngân hàng:</span> <strong className="text-on-surface">{bankName}</strong></p>
            <p className="mb-2"><span className="text-on-surface-variant">Số tài khoản:</span> <strong className="text-on-surface">{bankAcc}</strong></p>
            <p className="mb-2"><span className="text-on-surface-variant">Số tiền:</span> <strong className="text-error text-base">{order.amount.toLocaleString('vi-VN')} VNĐ</strong></p>
            <p><span className="text-on-surface-variant">Nội dung CK:</span> <strong className="text-primary bg-primary/10 px-2 py-1 rounded tracking-widest">{order.order_code}</strong></p>
          </div>
          <p className="text-xs text-error mt-3">Lưu ý: Bắt buộc nhập chính xác nội dung chuyển khoản để được duyệt tự động.</p>
        </div>
      </div>
    </div>
  );
}