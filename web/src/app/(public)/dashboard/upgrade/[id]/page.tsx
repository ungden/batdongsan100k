import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { createPaymentOrderAction } from './actions';

export default async function UpgradeListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // 1. Fetch listing details
  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, title, price, area, district, city, images, status, user_id, priority_level, vip_expires_at')
    .eq('id', id)
    .single();

  if (listingError || !listing || listing.user_id !== user.id) {
    notFound();
  }

  // 2. Fetch packages
  const { data: packages, error: pkgError } = await supabase
    .from('packages')
    .select('*')
    .eq('type', 'listing')
    .eq('is_active', true)
    .order('priority', { ascending: true });

  if (pkgError || !packages) {
    return <div>Error loading packages</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 bg-surface min-h-screen">
      <div className="mb-8">
        <Link href="/dashboard" className="text-primary font-medium hover:underline flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Quay lại Quản lý tin
        </Link>
        <h1 className="text-3xl font-extrabold text-on-surface">Nâng cấp tin đăng</h1>
        <p className="text-on-surface-variant mt-2">Đẩy tin lên đầu, tiếp cận nhiều khách hàng hơn với các gói VIP.</p>
      </div>

      {/* Listing Preview */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col md:flex-row gap-6 mb-12 items-center">
        <div className="w-full md:w-32 h-24 relative rounded-lg overflow-hidden shrink-0">
          <Image
            src={listing.images?.[0] || '/placeholder.jpg'}
            alt={listing.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="font-bold text-lg text-on-surface line-clamp-1">{listing.title}</h2>
          <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            {listing.district}, {listing.city}
          </p>
          <div className="mt-2 text-sm">
            <span className="text-outline">Trạng thái hiện tại: </span>
            <span className="font-bold text-primary">
              {listing.priority_level > 0 ? `Đang dùng Gói VIP (${new Date(listing.vip_expires_at).toLocaleDateString('vi-VN')})` : 'Tin thường (Cơ bản)'}
            </span>
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg: any) => (
          <div key={pkg.id} className={`bg-white rounded-2xl p-6 border-2 flex flex-col ${pkg.priority > 0 ? 'border-primary shadow-xl relative' : 'border-outline-variant/20 shadow-sm'}`}>
            {pkg.priority > 0 && pkg.priority === 20 && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm whitespace-nowrap">
                Được ưa chuộng nhất
              </div>
            )}
            
            <div className="mb-6 flex-1">
              <h3 className="text-xl font-bold text-on-surface mb-2">{pkg.name}</h3>
              <div className="text-3xl font-black text-on-surface mb-1">
                {pkg.price > 0 ? (pkg.price / 1000).toLocaleString('vi-VN') + 'k' : 'Miễn phí'}
                <span className="text-sm font-normal text-on-surface-variant"> / {pkg.duration_days} ngày</span>
              </div>
              <p className="text-sm text-on-surface-variant">{pkg.description}</p>
            </div>

            <ul className="space-y-3 mb-8 text-sm text-on-surface-variant">
              {Array.isArray(pkg.features) && pkg.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary shrink-0">check_circle</span>
                  <span>{feature}</span>
                </li>
              ))}
              {/* Also show interval if pushed */}
              {pkg.push_interval_hours > 0 && (
                <li className="flex items-start gap-2 font-bold text-primary">
                  <span className="material-symbols-outlined text-[18px] shrink-0">rocket_launch</span>
                  Hệ thống tự động đẩy tin lên TOP mỗi {pkg.push_interval_hours} giờ!
                </li>
              )}
            </ul>

            <form action={createPaymentOrderAction.bind(null, listing.id, pkg.id)}>
              <button 
                type="submit"
                disabled={listing.priority_level >= pkg.priority && pkg.priority > 0}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  listing.priority_level >= pkg.priority && pkg.priority > 0
                    ? 'bg-surface-container text-on-surface-variant cursor-not-allowed'
                    : pkg.priority > 0 
                      ? 'bg-primary text-white hover:bg-primary/90 shadow-md hover:-translate-y-1' 
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
                }`}
              >
                {listing.priority_level >= pkg.priority && pkg.priority > 0 ? 'Đang sử dụng' : 'Chọn gói này'}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
