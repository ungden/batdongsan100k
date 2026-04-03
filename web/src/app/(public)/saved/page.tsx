import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default async function SavedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch saved listings joined with listing details
  const { data: savedItems, error } = await supabase
    .from('saved_listings')
    .select(`
      created_at,
      listing_id,
      listings (*)
    `)
    .eq('user_id', user.id)
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
              <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-lg text-on-surface hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined">list_alt</span>
                Tin đăng của tôi
              </Link>
              <Link href="/saved" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/10 text-primary font-medium">
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
            <h1 className="text-2xl font-bold text-on-surface mb-6">Tin đã lưu</h1>

            {error ? (
              <div className="p-4 bg-error-container text-on-error-container rounded-lg">
                Không thể tải danh sách tin đã lưu.
              </div>
            ) : savedItems && savedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedItems.map((item: any) => {
                  const listing = item.listings;
                  if (!listing) return null;
                  
                  return (
                    <div key={listing.id} className="group bg-white border border-outline-variant/20 rounded-2xl overflow-hidden hover:shadow-xl transition-all flex flex-col h-full relative">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <Image
                          src={listing.images && listing.images.length > 0 ? listing.images[0] : "/placeholder.jpg"}
                          alt={listing.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm">
                          {listing.transaction_type === 'cho-thue' ? 'Cho thuê' : 'Bán'}
                        </div>
                        {/* Remove from saved button (would need client component to actually function) */}
                        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-error flex items-center justify-center shadow-sm">
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                        </button>
                      </div>

                      {/* Content */}
                      <div className="p-5 flex flex-col flex-grow">
                        <div className="text-xl font-bold text-error mb-2">
                          {(listing.price / 1000000000).toFixed(1).replace('.0', '')} Tỷ
                        </div>
                        <Link href={`/property/${listing.id}`} className="font-bold text-on-surface leading-tight mb-2 hover:text-primary transition-colors line-clamp-2">
                          {listing.title}
                        </Link>
                        <div className="text-sm text-on-surface-variant flex items-center gap-1 mb-4 line-clamp-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span>
                          {listing.district && listing.city ? `${listing.district}, ${listing.city}` : listing.address}
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-outline-variant/20 flex gap-4 text-sm text-on-surface-variant">
                          {listing.area && (
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[16px]">straighten</span>
                              {listing.area} m²
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
                <span className="material-symbols-outlined text-4xl text-outline mb-2">favorite_border</span>
                <p className="text-on-surface-variant font-medium">Bạn chưa lưu tin nào</p>
                <Link href="/listings" className="text-primary hover:underline mt-2 inline-block">Khám phá ngay</Link>
              </div>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
