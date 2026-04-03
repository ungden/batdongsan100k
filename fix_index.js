const fs = require('fs');

let content = fs.readFileSync('mobile/app/(tabs)/index.tsx', 'utf8');

// 1. Replace the mapSupabaseListingToProperty function
const newMapFunc = `// Helper function to map Supabase database listing to our app's Property interface
export function mapSupabaseListingToProperty(dbItem: any): Property {
  let parsedImages = ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'];
  if (typeof dbItem.images === 'string') {
    try {
      const parsed = JSON.parse(dbItem.images);
      if (Array.isArray(parsed) && parsed.length > 0) {
        parsedImages = parsed;
      }
    } catch (e) {
      console.error('Error parsing images:', e, dbItem.images);
    }
  } else if (Array.isArray(dbItem.images) && dbItem.images.length > 0) {
    parsedImages = dbItem.images;
  }

  let parsedFeatures = [];
  if (typeof dbItem.features === 'string') {
    try {
      parsedFeatures = JSON.parse(dbItem.features) || [];
    } catch (e) {
      console.error('Error parsing features:', e, dbItem.features);
    }
  } else if (Array.isArray(dbItem.features)) {
    parsedFeatures = dbItem.features;
  }

  return {
    id: dbItem.id,
    title: dbItem.title || '',
    slug: dbItem.slug || dbItem.id,
    price: dbItem.price || 0,
    priceFormatted: dbItem.price_formatted || '',
    priceUnit: dbItem.price_unit || 'tỷ',
    type: dbItem.type || 'nha-pho',
    category: dbItem.category || 'sale',
    address: dbItem.address || '',
    district: dbItem.district || '',
    city: dbItem.city || '',
    bedrooms: dbItem.bedrooms || 0,
    bathrooms: dbItem.bathrooms || 0,
    area: dbItem.area || 0,
    description: dbItem.description || '',
    images: parsedImages,
    features: parsedFeatures,
    agent: {
      id: dbItem.agent_id || 'system',
      name: 'Admin',
      phone: '0901234567',
      email: 'contact@titanhome.vn',
      avatar: 'https://i.pravatar.cc/150?u=system',
    },
    status: dbItem.status || 'approved',
    authorId: dbItem.created_by || '',
    createdAt: dbItem.created_at || new Date().toISOString(),
    updatedAt: dbItem.updated_at || new Date().toISOString(),
    isFeatured: dbItem.is_featured || false,
    priorityLevel: dbItem.priority_level || (dbItem.is_priority ? 1 : 0),
    sortDate: dbItem.sort_date || dbItem.created_at || new Date().toISOString(),
  };
}`;

content = content.replace(
  /\/\/ Helper function to map Supabase database listing to our app's Property interface[\s\S]*?  \};\n\}/,
  newMapFunc
);

// 2. Fix the supabase queries in fetchProperties
const oldQuery1 = `const { data: featuredData } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'published')
          .order('priority_level', { ascending: false })
          .order('sort_date', { ascending: false })
          .limit(5);`;

const newQuery1 = `const { data: featuredData, error: featuredError } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'published')
          .order('priority_level', { ascending: false })
          .order('sort_date', { ascending: false })
          .limit(5);
        if (featuredError) console.error('Featured query error:', featuredError);`;

const oldQuery2 = `const { data: nearbyData } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'published')
          .order('priority_level', { ascending: false })
          .order('sort_date', { ascending: false })
          .limit(10);`;

const newQuery2 = `const { data: nearbyData, error: nearbyError } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'published')
          .order('priority_level', { ascending: false })
          .order('sort_date', { ascending: false })
          .limit(10);
        if (nearbyError) console.error('Nearby query error:', nearbyError);`;

content = content.replace(oldQuery1, newQuery1);
content = content.replace(oldQuery2, newQuery2);

fs.writeFileSync('mobile/app/(tabs)/index.tsx', content);
console.log('Update complete');
