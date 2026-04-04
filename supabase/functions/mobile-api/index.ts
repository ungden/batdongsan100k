import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Body = {
  action?: string;
  keyword?: string;
  typeFilter?: string | null;
  slug?: string;
  listingId?: string;
  packageId?: string;
  orderId?: string;
  title?: string;
  description?: string;
  price?: number;
  area?: number;
  address?: string;
  type?: string;
  category?: string;
  features?: string[];
};

const PROJECT_NAMES = [
  'Vinhomes Grand Park', 'Vinhomes Smart City', 'Vinhomes Central Park',
  'Vinhomes Ocean Park', 'Vinhomes Golden River', 'Vinhomes Riverside',
  'Masteri Thảo Điền', 'Masteri Centre Point', 'Masteri An Phú',
  'Celadon City', 'Saigon Pearl', 'Diamond Island', 'Richstar',
  'Sky Garden', 'The Manor', 'Lexington Residence', 'Dream Home',
  'Midtown', 'Eco Green', 'The Gold View', 'Centana', 'Botanica',
  'Feliz En Vista', 'Sunrise City', 'Sunrise Riverside',
  'The Sun Avenue', 'Mizuki Park', 'Landmark 81', 'Aqua City',
  'Empire City', 'Sunwah Pearl', 'Phú Mỹ Hưng', 'Sala',
  'Tây Hồ Tây', 'Royal City', 'Times City',
];

function detectProjectCondition() {
  return PROJECT_NAMES.map((name) => `title.ilike.%${name}%`).join(',');
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = (await req.json()) as Body;
    const action = body.action;

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization') || '';

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: authData } = await userClient.auth.getUser();
    const user = authData.user;

    const requireUser = () => {
      if (!user) throw new Error('Unauthorized');
      return user;
    };

    if (action === 'get_home_feed') {
      const [featuredResult, nearbyResult] = await Promise.all([
        adminClient
          .from('properties')
          .select('id, title, slug, price, price_formatted, price_unit, type, category, address, district, city, bedrooms, bathrooms, area, images, is_featured, is_vip, is_priority, created_at')
          .eq('status', 'published')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5),
        adminClient
          .from('properties')
          .select('id, title, slug, price, price_formatted, price_unit, type, category, address, district, city, bedrooms, bathrooms, area, images, is_featured, is_vip, is_priority, created_at')
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(10),
      ]);
      if (featuredResult.error) throw featuredResult.error;
      if (nearbyResult.error) throw nearbyResult.error;
      return json({ success: true, data: { featured: featuredResult.data || [], nearby: nearbyResult.data || [] } });
    }

    if (action === 'search_listings') {
      let query = adminClient
        .from('properties')
        .select('id, title, slug, price, price_formatted, price_unit, type, category, address, district, city, bedrooms, bathrooms, area, images, is_featured, is_vip, is_priority, created_at')
        .eq('status', 'published');
      if (body.keyword?.trim()) {
        query = query.or(`title.ilike.%${body.keyword.trim()}%,address.ilike.%${body.keyword.trim()}%,district.ilike.%${body.keyword.trim()}%,city.ilike.%${body.keyword.trim()}%`);
      }
      if (body.typeFilter) {
        query = query.eq('type', body.typeFilter);
      }
      const { data, error } = await query
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return json({ success: true, data: data || [] });
    }

    if (action === 'get_listing_detail') {
      if (!body.listingId) return json({ success: false, error: 'listingId is required' }, 400);
      const { data, error } = await adminClient
        .from('properties')
        .select('*, agent:agents(id, name, phone, avatar)')
        .eq('id', body.listingId)
        .eq('status', 'published')
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    if (action === 'get_projects' || action === 'get_project_detail') {
      const { data, error } = await adminClient
        .from('properties')
        .select('id, title, slug, price, price_formatted, price_unit, type, category, address, district, city, bedrooms, bathrooms, area, images, is_featured, created_at')
        .eq('status', 'published')
        .or(detectProjectCondition())
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(action === 'get_projects' ? 60 : 120);

      if (error) throw error;
      return json({ success: true, data: data || [] });
    }

    if (action === 'get_packages') {
      requireUser();
      const { data, error } = await adminClient
        .from('packages')
        .select('*')
        .eq('type', 'listing')
        .eq('is_active', true)
        .order('priority', { ascending: true });
      if (error) throw error;
      return json({ success: true, data });
    }

    if (action === 'get_favorites') {
      const currentUser = requireUser();
      const { data, error } = await adminClient
        .from('saved_listings')
        .select('listing_id')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return json({ success: true, data: data.map((item) => item.listing_id) });
    }

    if (action === 'toggle_favorite') {
      const currentUser = requireUser();
      if (!body.listingId) return json({ success: false, error: 'listingId is required' }, 400);
      const { data: existing } = await adminClient
        .from('saved_listings')
        .select('listing_id')
        .eq('user_id', currentUser.id)
        .eq('listing_id', body.listingId)
        .maybeSingle();

      if (existing) {
        const { error } = await adminClient
          .from('saved_listings')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('listing_id', body.listingId);
        if (error) throw error;
        return json({ success: true, data: { saved: false } });
      }

      const { error } = await adminClient.from('saved_listings').insert({
        user_id: currentUser.id,
        listing_id: body.listingId,
      });
      if (error) throw error;
      return json({ success: true, data: { saved: true } });
    }

    if (action === 'get_profile_stats') {
      const currentUser = requireUser();
      const [{ count: listingCount }, { count: favoriteCount }] = await Promise.all([
        adminClient.from('properties').select('*', { count: 'exact', head: true }).eq('created_by', currentUser.id),
        adminClient.from('saved_listings').select('*', { count: 'exact', head: true }).eq('user_id', currentUser.id),
      ]);
      return json({ success: true, data: { listingCount: listingCount || 0, favoriteCount: favoriteCount || 0 } });
    }

    if (action === 'get_my_listings') {
      const currentUser = requireUser();
      const { data, error } = await adminClient
        .from('properties')
        .select('id, title, slug, price, price_formatted, price_unit, type, category, address, district, city, area, images, status, created_at')
        .eq('created_by', currentUser.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return json({ success: true, data });
    }

    if (action === 'create_listing') {
      const currentUser = requireUser();
      if (!body.title || !body.price || !body.area || !body.type) {
        return json({ success: false, error: 'Missing required fields' }, 400);
      }

      const category = body.category || 'sale';
      const slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        + '-' + Date.now().toString(36);

      const { data, error } = await adminClient
        .from('properties')
        .insert({
          title: body.title,
          slug,
          price: category === 'rent' ? body.price * 1_000_000 : body.price * 1_000_000_000,
          price_unit: category === 'rent' ? 'trieu/thang' : 'ty',
          type: body.type,
          category,
          status: 'pending_review',
          description: body.description || '',
          area: body.area,
          address: body.address || '',
          district: '',
          city: '',
          images: [],
          features: body.features || [],
          created_by: currentUser.id,
        })
        .select('id, title, slug, status')
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    if (action === 'create_payment_order') {
      const currentUser = requireUser();
      if (!body.listingId || !body.packageId) return json({ success: false, error: 'listingId and packageId are required' }, 400);

      const { data: listing, error: listingError } = await adminClient
        .from('properties')
        .select('id, created_by')
        .eq('id', body.listingId)
        .single();
      if (listingError || !listing || listing.created_by !== currentUser.id) return json({ success: false, error: 'Listing not found' }, 404);

      const { data: pkg, error: pkgError } = await adminClient
        .from('packages')
        .select('*')
        .eq('id', body.packageId)
        .single();
      if (pkgError || !pkg) return json({ success: false, error: 'Package not found' }, 404);

      if (pkg.price === 0) {
        const expiresAt = new Date(Date.now() + pkg.duration_days * 24 * 60 * 60 * 1000).toISOString();
        await adminClient.from('listing_packages').insert({
          listing_id: body.listingId,
          package_id: body.packageId,
          package_name: pkg.name,
          started_at: new Date().toISOString(),
          expires_at: expiresAt,
          is_active: true,
        });
        await adminClient.from('properties').update({
          is_vip: pkg.priority > 0,
          is_priority: pkg.priority > 0,
        }).eq('id', body.listingId);
        return json({ success: true, data: { id: 'free-package', status: 'paid', amount: 0, plan: pkg.name, order_code: 'FREE' } });
      }

      const orderCode = `TT${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      const { data: order, error: orderError } = await adminClient
        .from('payment_orders')
          .insert({
          user_id: currentUser.id,
          listing_id: body.listingId,
          package_id: body.packageId,
          amount: pkg.price,
          status: 'pending',
          order_code: orderCode,
          plan: pkg.name,
        })
        .select('*')
        .single();
      if (orderError) throw orderError;
      return json({ success: true, data: order });
    }

    if (action === 'get_payment_order') {
      const currentUser = requireUser();
      if (!body.orderId) return json({ success: false, error: 'orderId is required' }, 400);
      if (body.orderId === 'free-package') {
        return json({ success: true, data: { id: 'free-package', status: 'paid', amount: 0, plan: 'Tin Thường', order_code: 'FREE' } });
      }
      const { data, error } = await adminClient
        .from('payment_orders')
        .select('*')
        .eq('id', body.orderId)
        .eq('user_id', currentUser.id)
        .single();
      if (error) throw error;
      return json({ success: true, data });
    }

    return json({ success: false, error: 'Unsupported action' }, 400);
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500);
  }
});
