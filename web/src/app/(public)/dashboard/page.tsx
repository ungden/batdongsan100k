import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's listings
  const { data: listings, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', user.id)
    .order('is_vip', { ascending: false })
      .order('priority_level', { ascending: false })
      .order('sort_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-6 sticky top-24">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-on-surface truncate max-w-[150px]">{profile?.full_name || 'Người dùng'}</h3>
                <p className="text-xs text-on-surface-variant truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>

            <nav className="space-y-2">
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium">
                <span className="material-symbols-outlined">list_alt</span>
                Tin đăng của tôi
              </Link>
              <Link href="/saved" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">favorite</span>
                Tin đã lưu
              </Link>
              <Link href="/post" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">add_circle</span>
                Đăng tin mới
              </Link>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/20 p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-on-surface">Quản lý tin đăng</h1>
              <Link href="/post" className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">add</span>
                Đăng tin
              </Link>
            </div>

            {error ? (
              <div className="p-4 bg-error-container text-on-error-container rounded-lg">
                Không thể tải danh sách tin đăng.
              </div>
            ) : listings && listings.length > 0 ? (
              <div className="space-y-4">
                {listings.map((listing: any) => (
                  <div key={listing.id} className="flex flex-col sm:flex-row gap-4 p-4 border border-outline-variant/20 rounded-xl hover:shadow-md transition-shadow">
                    <div className="w-full sm:w-48 h-32 relative rounded-lg overflow-hidden shrink-0">
                      <Image 
                        src={(listing.images && listing.images[0]) || '/placeholder.jpg'} 
                        alt={listing.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-surface/90 backdrop-blur rounded text-xs font-bold text-primary">
                        {listing.status === 'approved' ? 'Đã duyệt' : listing.status === 'pending' ? 'Chờ duyệt' : 'Bị từ chối'}
                      </div>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link href={`/property/${listing.id}`} className="font-bold text-lg text-on-surface hover:text-primary transition-colors line-clamp-2">
                          {listing.title}
                        </Link>
                        <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          {listing.district && listing.city ? `${listing.district}, ${listing.city}` : listing.address}
                        </p>
                      </div>
                      
                      <div className="flex justify-between items-end mt-4">
                        <div className="font-bold text-error">
                          {(listing.price / 1000000000).toFixed(1).replace('.0', '')} Tỷ
                        </div>
                        <div className="flex gap-2">
                          {listing.status === 'approved' && (
                            <Link href={`/dashboard/upgrade/${listing.id}`} className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold rounded-lg transition-colors flex items-center gap-1 text-sm tooltip-trigger" title="Nâng cấp VIP">
                              <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
                              Nâng cấp
                            </Link>
                          )}
                          <Link href={`/dashboard/edit/${listing.id}`} className="p-1.5 text-primary hover:bg-primary/10 rounded-full transition-colors flex items-center tooltip-trigger" title="Sửa tin">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                          </Link>
                          <button className="p-1.5 text-error hover:bg-error/10 rounded-full transition-colors flex items-center" title="Xóa tin">
                            <span className="material-symbols-outlined text-[20px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">home_work</span>
                <p className="text-on-surface-variant font-medium">Bạn chưa có tin đăng nào</p>
                <Link href="/post" className="text-primary hover:underline mt-2 inline-block">Đăng tin ngay</Link>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
