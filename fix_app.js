const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 1. Find all VinaEstate and replace with TitanHome in mobile folder
const files = execSync('grep -rl "VinaEstate" mobile/').toString().split('\n').filter(Boolean);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/VinaEstate/g, 'TitanHome');
  fs.writeFileSync(file, content);
  console.log(`Replaced VinaEstate in ${file}`);
});

// 2. Fix index.tsx mappings and queries
const indexPath = 'mobile/app/(tabs)/index.tsx';
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Replace the mapSupabaseListingToProperty function
const newMapper = `export function mapSupabaseListingToProperty(dbItem: any): Property {
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
    images: dbItem.images && dbItem.images.length > 0 ? dbItem.images : ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6'],
    features: dbItem.features || [],
    agent: {
      id: dbItem.agent_id || 'system',
      name: 'Admin',
      phone: '0901234567',
      email: 'contact@titanhome.vn',
      avatar: 'https://i.pravatar.cc/150?u=system',
    },
    status: dbItem.status || 'published',
    authorId: dbItem.created_by || '',
    createdAt: dbItem.created_at || new Date().toISOString(),
    updatedAt: dbItem.updated_at || new Date().toISOString(),
    isFeatured: dbItem.is_featured || false,
    priorityLevel: dbItem.is_priority ? 1 : 0,
    sortDate: dbItem.created_at || new Date().toISOString(),
  };
}`;

indexContent = indexContent.replace(/export function mapSupabaseListingToProperty[\s\S]*?\}\n\nexport default function HomeScreen/, newMapper + '\n\nexport default function HomeScreen');

// Replace the queries in fetchProperties
const oldFeaturedQuery = `const { data: featuredData } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'approved')
          .order('priority_level', { ascending: false, nullsFirst: false })
          .order('sort_date', { ascending: false, nullsFirst: false })
          .limit(5);`;

const newFeaturedQuery = `const { data: featuredData } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'published')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(5);`;

const oldNearbyQuery = `const { data: nearbyData } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'approved')
          .order('priority_level', { ascending: false, nullsFirst: false })
          .order('sort_date', { ascending: false, nullsFirst: false })
          .limit(10);`;

const newNearbyQuery = `const { data: nearbyData } = await supabase
          .from('properties')
          .select('*')
          .eq('status', 'published')
          .order('views_count', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);`;

indexContent = indexContent.replace(oldFeaturedQuery, newFeaturedQuery);
indexContent = indexContent.replace(oldNearbyQuery, newNearbyQuery);

fs.writeFileSync(indexPath, indexContent);
console.log('Fixed mobile/app/(tabs)/index.tsx queries and mapping');

