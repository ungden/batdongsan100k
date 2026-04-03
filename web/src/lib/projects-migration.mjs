import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'web/.env.local' });

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const KNOWN_PROJECTS = [
  'Vinhomes Riverside', 'Vinhomes Ocean Park', 'Vinhomes Grand Park',
  'Landmark 81', 'Masteri Thảo Điền', 'Masteri Centre Point',
  'The Sun Avenue', 'Aqua City', 'Ecopark Grand', 'Lakeview City',
  'Tây Hồ Tây', 'Empire City', 'Sunwah Pearl', 'The Rivus',
  'Holm', 'Sadeco', 'Belleville', 'Verosa Park', 'The Marq'
];

function slugify(value) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function migrate() {
  console.log("Fetching listings...");
  let page = 0;
  const pageSize = 1000;
  let allListings = [];

  while (true) {
    const { data, error } = await supabase.from('listings').select('id, title, address, district, city, images').range(page * pageSize, (page + 1) * pageSize - 1);
    if (error) {
      console.error(error);
      break;
    }
    if (!data || data.length === 0) break;
    allListings.push(...data);
    page++;
  }

  console.log(`Found ${allListings.length} listings. Processing projects...`);
  
  // Group properties into projects
  const projectData = new Map();
  for (const listing of allListings) {
    const haystack = `${listing.title} ${listing.address}`.toLowerCase();
    const matched = KNOWN_PROJECTS.find(name => haystack.includes(name.toLowerCase()));
    if (matched) {
      const slug = slugify(matched);
      if (!projectData.has(slug)) {
        projectData.set(slug, {
          name: matched,
          slug: slug,
          city: listing.city || 'Chưa cập nhật',
          district: listing.district || 'Chưa cập nhật',
          cover_image: (listing.images && listing.images.length > 0) ? listing.images[0] : null,
          listing_ids: []
        });
      }
      projectData.get(slug).listing_ids.push(listing.id);
    }
  }

  console.log(`Discovered ${projectData.size} unique projects.`);

  // Insert Projects and update Listings
  for (const [slug, proj] of projectData.entries()) {
    console.log(`Upserting project: ${proj.name}...`);
    let { data: existingProject } = await supabase.from('projects').select('id').eq('slug', slug).single();
    
    let projectId;
    if (existingProject) {
      projectId = existingProject.id;
    } else {
      const { data: newProject, error: insertError } = await supabase.from('projects').insert({
        name: proj.name,
        slug: proj.slug,
        city: proj.city,
        district: proj.district,
        cover_image: proj.cover_image
      }).select('id').single();
      
      if (insertError) {
        console.error(`Failed to insert project ${proj.name}:`, insertError);
        continue;
      }
      projectId = newProject.id;
    }

    if (projectId && proj.listing_ids.length > 0) {
      console.log(`Mapping ${proj.listing_ids.length} listings to project ${projectId}...`);
      
      const chunkSize = 100;
      for (let i = 0; i < proj.listing_ids.length; i += chunkSize) {
        const chunk = proj.listing_ids.slice(i, i + chunkSize);
        await supabase.from('listings').update({ project_id: projectId }).in('id', chunk);
      }
    }
  }

  console.log("Migration complete!");
}

migrate();
