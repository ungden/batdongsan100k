import { readFileSync } from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

function parseArgs(argv) {
  const args = {
    input: null,
    dryRun: argv.includes("--dry-run"),
    limit: null,
  };

  for (const raw of argv) {
    if (raw.startsWith("--input=")) args.input = raw.split("=")[1] || null;
    if (raw.startsWith("--limit=")) args.limit = Number(raw.split("=")[1]) || null;
  }

  return args;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function dedupKeys(item) {
  const normalize = (value) =>
    normalizeWhitespace(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const title = normalize(item.title || "");
  const address = normalize(item.address || "");
  const district = normalize(item.district || item.city || "");
  const price = item.price || item.price_raw || "na";
  const area = item.area || 0;

  return [
    `${title}::${district}::${price}::${area}`,
    address ? `${address}::${price}::${area}` : null,
  ].filter(Boolean);
}

function resolveInputPath(input) {
  if (!input) {
    return path.resolve("output/new-sources-images-test/multi-source-listings.json");
  }
  return path.resolve(input);
}

function withSourceTrail(description, source, externalUrl, postedDate) {
  const lines = [normalizeWhitespace(description || "")];
  const trail = [`Nguon: ${source}`];
  if (postedDate) trail.push(`Dang ngay: ${postedDate}`);
  if (externalUrl) trail.push(`URL goc: ${externalUrl}`);
  lines.push(trail.join(" | "));
  return lines.filter(Boolean).join("\n\n").slice(0, 5000);
}

// ============================================================
// City name normalization (must match multi-source-crawl.mjs)
// ============================================================
const CITY_ALIASES = new Map([
  ["TP Hồ Chí Minh", "Hồ Chí Minh"], ["Tp. Hồ Chí Minh", "Hồ Chí Minh"],
  ["TPHCM", "Hồ Chí Minh"], ["Thành phố Hồ Chí Minh", "Hồ Chí Minh"],
  ["TP Hà Nội", "Hà Nội"], ["Tp. Hà Nội", "Hà Nội"],
  ["Thành phố Hà Nội", "Hà Nội"],
  ["Tp. Đà Nẵng", "Đà Nẵng"], ["Tp. Cần Thơ", "Cần Thơ"],
  ["Tp. Hải Phòng", "Hải Phòng"],
  ["T. Bình Dương", "Bình Dương"], ["T. Đồng Nai", "Đồng Nai"],
  ["T. Khánh Hòa", "Khánh Hòa"], ["T. Bà Rịa - Vũng Tàu", "Bà Rịa Vũng Tàu"],
  ["T. Long An", "Long An"], ["T. Thừa Thiên Huế", "Thừa Thiên Huế"],
  ["T. Lâm Đồng", "Lâm Đồng"], ["T. Bắc Ninh", "Bắc Ninh"],
]);

function normalizeCity(rawCity) {
  const city = (rawCity || "").trim();
  if (!city) return "";
  if (CITY_ALIASES.has(city)) return CITY_ALIASES.get(city);
  if (city.startsWith("Địa chỉ:") || city.length > 50) return "";
  return city;
}

function normalizePriceUnit(unit) {
  const value = normalizeWhitespace(unit).toLowerCase();
  if (!value) return "trieu";
  if (value.includes("tỷ") || value === "ty") return "ty";
  if (value.includes("triệu") || value.includes("tr") || value === "trieu") return "trieu";
  return "trieu";
}

async function ensureAgents(supabase, listings) {
  const agentMap = new Map();
  const uniqueContacts = new Map();

  for (const listing of listings) {
    if (listing.contact_phone && listing.contact_name && !uniqueContacts.has(listing.contact_phone)) {
      uniqueContacts.set(listing.contact_phone, {
        name: listing.contact_name,
        phone: listing.contact_phone,
      });
    }
  }

  const { data: existing, error: existingError } = await supabase.from("agents").select("id, phone");
  if (existingError) throw existingError;
  for (const agent of existing || []) {
    if (agent.phone) agentMap.set(agent.phone, agent.id);
  }

  let created = 0;
  for (const [phone, contact] of uniqueContacts.entries()) {
    if (agentMap.has(phone)) continue;
    const { data, error } = await supabase.rpc("create_agent", {
      p_name: contact.name,
      p_phone: contact.phone,
    });
    if (error) continue;
    if (data) {
      agentMap.set(phone, data);
      created += 1;
    }
  }

  return { agentMap, created, existing: agentMap.size - created };
}

async function loadExistingPropertyKeys(supabase) {
  const { data, error } = await supabase
    .from("properties")
    .select("title, address, district, city, price, area");
  if (error) throw error;

  const seen = new Set();
  for (const item of data || []) {
    dedupKeys({
      title: item.title,
      address: item.address,
      district: item.district,
      city: item.city,
      price: item.price,
      area: item.area,
    }).forEach((key) => seen.add(key));
  }
  return seen;
}

async function insertListings(supabase, listings, dryRun) {
  const existingKeys = dryRun ? new Set() : await loadExistingPropertyKeys(supabase);
  const { agentMap, created, existing } = dryRun
    ? { agentMap: new Map(), created: 0, existing: 0 }
    : await ensureAgents(supabase, listings);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;

  for (const listing of listings) {
    const keys = dedupKeys(listing);
    if (keys.some((key) => existingKeys.has(key))) {
      skipped += 1;
      continue;
    }

    const payload = {
      title: listing.title,
      slug: listing.slug,
      price: listing.price || 0,
      price_formatted: listing.price_formatted || null,
      price_unit: normalizePriceUnit(listing.price_unit),
      type: listing.type,
      category: listing.category,
      status: "published",
      address: listing.address || "",
      district: listing.district || "",
      city: normalizeCity(listing.city),
      bedrooms: listing.bedrooms || 0,
      bathrooms: listing.bathrooms || 0,
      area: listing.area || 0,
      floor: listing.floor,
      direction: listing.direction,
      description: withSourceTrail(
        listing.description,
        listing.source,
        listing.external_url,
        listing.posted_date,
      ),
      images: (listing.images || []).slice(0, 12),
      features: Array.from(
        new Set(listing.features || []),
      ).slice(0, 20),
      source: listing.source || null,
      external_url: listing.external_url || null,
      external_id: listing.external_id || null,
      agent_id: listing.contact_phone ? agentMap.get(listing.contact_phone) || null : null,
      is_featured: Boolean(listing.is_latest),
      views_count: Math.max(0, Number(listing.freshness_rank || 0)),
    };

    if (dryRun) {
      inserted += 1;
      keys.forEach((key) => existingKeys.add(key));
      continue;
    }

    const { error } = await supabase.from("properties").insert(payload);
    if (error) {
      if (error.message?.includes("duplicate") || error.message?.includes("unique") || error.code === "23505") {
        skipped += 1;
        keys.forEach((key) => existingKeys.add(key));
        continue;
      }

      failed += 1;
      if (failed <= 5) {
        console.error(`Insert error [${listing.slug}]: ${error.message}`);
      }
      continue;
    }

    inserted += 1;
    keys.forEach((key) => existingKeys.add(key));
  }

  return { inserted, skipped, failed, createdAgents: created, existingAgents: existing };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputPath = resolveInputPath(args.input);
  const allListings = JSON.parse(readFileSync(inputPath, "utf-8"));
  const listings = args.limit ? allListings.slice(0, args.limit) : allListings;

  console.log(`Loaded ${listings.length} listings from ${inputPath}`);

  if (args.dryRun) {
    const summary = await insertListings(null, listings, true);
    console.log("Dry run summary:");
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  const supabaseUrl = requireEnv("SUPABASE_URL");
  const supabaseKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const supabase = createClient(supabaseUrl, supabaseKey);

  const summary = await insertListings(supabase, listings, false);
  console.log("Insert summary:");
  console.log(JSON.stringify(summary, null, 2));

  const { count } = await supabase.from("properties").select("*", { count: "exact", head: true });
  console.log(`Total properties in DB: ${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
