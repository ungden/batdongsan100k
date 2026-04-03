import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import PropertyCard from '@/components/PropertyCard';
import { Property } from '@/lib/types';

export default async function AgentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Try to find the agent in profiles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !profile) {
    notFound();
  }

  // Fetch properties published by this agent
  const { data: listings } = await supabase
    .from('properties')
    .select('*')
    .eq('agent_id', id)
    .eq('status', 'approved')
    .order('is_vip', { ascending: false })
      .order('is_priority', { ascending: false })
      .order('created_at', { ascending: false });

  const mappedListings: Property[] = (listings || []).map((dbItem: any) => {
    let priceFormatted = '';
    let priceUnit: 'tỷ' | 'triệu' | 'triệu/tháng' = 'tỷ';
  
    if (dbItem.price) {
      if (dbItem.category === 'rent' || dbItem.transaction_type === 'cho-thue') {
        priceUnit = 'triệu/tháng';
        priceFormatted = (dbItem.price / 1000000).toFixed(0);
      } else {
        if (dbItem.price >= 1000000000) {
          priceUnit = 'tỷ';
          priceFormatted = (dbItem.price / 1000000000).toFixed(1).replace('.0', '');
        } else {
          priceUnit = 'triệu';
          priceFormatted = (dbItem.price / 1000000).toFixed(0);
        }
      }
    }
  
    return {
      id: dbItem.id,
      title: dbItem.title || '',
      slug: dbItem.id,
      price: dbItem.price || 0,
      priceFormatted,
      priceUnit,
      type: dbItem.category === 'apartment' ? 'chung-cu' : 'nha-pho',
      category: dbItem.category === 'rent' || dbItem.transaction_type === 'cho-thue' ? 'rent' : 'sale',
      address: dbItem.address || '',
      district: dbItem.district || '',
      city: dbItem.city || '',
      bedrooms: 0,
      bathrooms: 0,
      area: dbItem.area || 0,
      description: dbItem.description || '',
      images: dbItem.images && dbItem.images.length > 0 ? dbItem.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'],
      features: [],
      agent: {
        id: profile.id,
        name: profile.full_name || 'Người dùng',
        phone: profile.phone || '',
        email: '',
        avatar: profile.avatar_url || 'https://i.pravatar.cc/150?img=33',
      },
      status: 'published',
      authorId: profile.id,
      createdAt: dbItem.created_at,
      updatedAt: dbItem.updated_at,
      isFeatured: dbItem.is_vip || false,
    };
  });

  return (
    <div className="pt-20 min-h-screen bg-surface">
      {/* Agent Header Banner */}
      <div className="bg-[#001e40] text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 flex flex-col md:flex-row items-center gap-8">
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-white overflow-hidden shrink-0">
            <Image 
              src={profile.avatar_url || 'https://i.pravatar.cc/300?img=11'} 
              alt={profile.full_name || 'Agent'} 
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-widest backdrop-blur-md">
              Thành viên TitanHome
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-4">{profile.full_name || 'Thành viên vô danh'}</h1>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 sm:gap-8 text-white/80">
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined">call</span>
                  <span className="font-medium text-lg">{profile.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">home_work</span>
                <span>{mappedListings.length} bất động sản</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span>4.9/5 Đánh giá</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-outline-variant/20 sticky top-24">
            <h3 className="text-lg font-bold text-on-surface mb-6">Liên hệ với chuyên viên</h3>
            
            <div className="space-y-4 mb-8">
              <a href={`tel:${profile.phone || ''}`} className="w-full flex items-center justify-center gap-3 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
                <span className="material-symbols-outlined">call</span>
                Gọi điện ngay
              </a>
              <a href={`https://zalo.me/${profile.phone || ''}`} target="_blank" rel="noreferrer" className="w-full flex items-center justify-center gap-3 bg-[#0068ff] text-white py-3 rounded-lg font-bold hover:bg-[#0054cc] transition-colors">
                <span className="material-symbols-outlined">chat</span>
                Nhắn tin Zalo
              </a>
            </div>

            <hr className="border-outline-variant/20 mb-6" />

            <h4 className="font-bold text-sm text-on-surface-variant uppercase tracking-wider mb-4">Thông tin thêm</h4>
            <div className="space-y-3 text-sm text-on-surface">
              <div className="flex justify-between border-b border-outline-variant/10 pb-3">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">location_on</span>
                  Khu vực:
                </span>
                <span className="font-medium text-right">Toàn quốc</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-on-surface-variant flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">event</span>
                  Tham gia từ:
                </span>
                <span className="font-medium">{new Date(profile.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-on-surface">Bất động sản đang bán</h2>
              <p className="text-on-surface-variant mt-1">Khám phá các bất động sản nổi bật từ chuyên viên này</p>
            </div>
            <Link href="/listings" className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
              Tất cả bất động sản <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          {mappedListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {mappedListings.map((property, index) => (
                <PropertyCard key={property.id} property={property} priority={index < 4} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/50">
              <span className="material-symbols-outlined text-6xl text-outline mb-4">home_work</span>
              <p className="text-xl font-bold text-on-surface mb-2">Chưa có bất động sản nào</p>
              <p className="text-on-surface-variant">Chuyên viên này hiện chưa có tin đăng nào đang mở bán.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}