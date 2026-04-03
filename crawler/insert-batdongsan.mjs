import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || requireEnv("SUPABASE_ANON_KEY");

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const listings = JSON.parse(readFileSync("batdongsan-listings.json", "utf-8"));
console.log(`Loaded ${listings.length} listings\n`);

// First, create agents from unique contacts
const agentMap = new Map(); // phone → agent_id

async function ensureAgents() {
  const uniqueContacts = new Map();
  for (const l of listings) {
    if (l.contact_phone && l.contact_name && !uniqueContacts.has(l.contact_phone)) {
      uniqueContacts.set(l.contact_phone, {
        name: l.contact_name,
        phone: l.contact_phone,
      });
    }
  }

  console.log(`Found ${uniqueContacts.size} unique contacts, creating agents...`);

  // Get existing agents
  const { data: existing } = await supabase.from("agents").select("id, phone");
  if (existing) {
    for (const a of existing) {
      if (a.phone) agentMap.set(a.phone, a.id);
    }
  }
  console.log(`Existing agents: ${agentMap.size}`);

  // Insert new agents via RPC (bypasses RLS)
  let created = 0;
  for (const [phone, contact] of uniqueContacts) {
    if (agentMap.has(phone)) continue;
    const { data, error } = await supabase.rpc("create_agent", {
      p_name: contact.name,
      p_phone: contact.phone,
    });
    if (!error && data) {
      agentMap.set(phone, data);
      created++;
    }
    if (created % 50 === 0 && created > 0) process.stdout.write(`\rAgents created: ${created}`);
  }
  console.log(`\nNew agents created: ${created}, total: ${agentMap.size}`);
}

async function insertProperties() {
  let inserted = 0;
  let failed = 0;
  let skipped = 0;

  for (const l of listings) {
    const agentId = l.contact_phone ? agentMap.get(l.contact_phone) : null;

    const { error } = await supabase.rpc("bulk_insert_property", {
      p_title: l.title,
      p_slug: l.slug,
      p_price: l.price,
      p_price_formatted: l.price_formatted,
      p_price_unit: l.price_unit,
      p_type: l.type,
      p_category: l.category,
      p_status: "published",
      p_address: l.address,
      p_district: l.district,
      p_city: l.city,
      p_bedrooms: l.bedrooms || 0,
      p_bathrooms: l.bathrooms || 0,
      p_area: l.area || 0,
      p_floor: l.floor,
      p_direction: l.direction,
      p_description: l.description,
      p_images: l.images,
      p_features: l.features,
      p_agent_id: agentId,
      p_is_featured: l.is_featured || false,
      p_views_count: l.views_count || 0,
      p_days_ago: l.created_days_ago || 0,
    });

    if (error) {
      failed++;
      if (failed <= 5) console.error(`\nError [${l.slug}]: ${error.message}`);
    } else {
      inserted++;
    }

    if ((inserted + failed) % 50 === 0) {
      process.stdout.write(`\r${inserted} ok, ${failed} err, ${skipped} skip / ${listings.length}`);
    }
  }

  console.log(`\n\nDone: ${inserted} inserted, ${failed} failed out of ${listings.length}`);
}

async function main() {
  await ensureAgents();
  await insertProperties();

  // Final count
  const { count } = await supabase.from("properties").select("*", { count: "exact", head: true });
  console.log(`\nTotal properties in DB: ${count}`);
}

main().catch(console.error);
