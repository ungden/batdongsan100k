import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

const supabase = createClient(
  requireEnv("SUPABASE_URL"),
  process.env.SUPABASE_SERVICE_ROLE_KEY || requireEnv("SUPABASE_ANON_KEY")
);

const listings = JSON.parse(readFileSync("listings-real.json", "utf-8"));
const ADMIN_ID = "6ff8caa1-d08e-442a-8a53-9e743316fb59";

let inserted = 0;
let failed = 0;

async function main() {
  for (const l of listings) {
    const { error } = await supabase.rpc("bulk_insert_listing", {
      p_user_id: ADMIN_ID,
      p_title: (l.title || "").substring(0, 500),
      p_description: l.description ? l.description.substring(0, 5000) : null,
      p_price: l.price || 0,
      p_address: l.address || null,
      p_district: l.district || null,
      p_city: l.city || null,
      p_province: l.province || null,
      p_category: l.category || "Nhà ở",
      p_area: l.area ? Math.round(l.area) : null,
      p_images: (l.images || []).slice(0, 6),
      p_is_verified: l.is_verified || false,
      p_is_vip: l.is_vip || false,
      p_contact_name: (l.contact_name || "Chủ nhà").substring(0, 100),
      p_contact_phone: l.contact_phone || null,
      p_rent_price: l.rent_price || null,
      p_transaction_type: l.transaction_type || "sang-nhuong",
      p_views: l.views || 0,
    });

    if (error) {
      failed++;
      if (failed <= 3) console.error(`Error: ${error.message}`);
    } else {
      inserted++;
    }

    if ((inserted + failed) % 100 === 0) {
      process.stdout.write(`\r${inserted} ok, ${failed} err / ${listings.length}`);
    }
  }

  console.log(`\n\nDone: ${inserted} inserted, ${failed} failed out of ${listings.length}`);
}

main();
