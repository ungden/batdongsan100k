import { writeFileSync, existsSync, readFileSync } from "fs";

// Deep crawl HCM + HN - go deeper into pages for more diverse data
const API_BASE = "https://gateway.chotot.com/v1/public/ad-listing";
const BATCH_SIZE = 50;
const DELAY_MS = 600;

// Already crawled slugs - load from existing data to avoid duplicates
const existingSlugs = new Set();
if (existsSync("batdongsan-listings.json")) {
  JSON.parse(readFileSync("batdongsan-listings.json", "utf-8")).forEach(l => existingSlugs.add(l.title));
}
if (existsSync("chotot-v2.json")) {
  JSON.parse(readFileSync("chotot-v2.json", "utf-8")).forEach(l => existingSlugs.add(l.title));
}
console.log(`Loaded ${existingSlugs.size} existing titles for dedup\n`);

const CATEGORIES = [
  { cg: 1010, type: "chung-cu", total: 10000 },
  { cg: 1020, type: "nha-pho", total: 10000 },
  { cg: 1030, type: "dat-nen", total: 7376 },
  { cg: 1040, type: "van-phong", total: 5554 },
  { cg: 1050, type: "phong-tro", total: 10000 },
];

const REGIONS = [
  { code: 13000, name: "Hồ Chí Minh" },
  { code: 12000, name: "Hà Nội" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
    .replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 200);
}

function formatPrice(price) {
  if (!price || price <= 0) return { formatted: "0", unit: "ty" };
  if (price >= 1e9) return { formatted: (price / 1e9).toFixed(1).replace(/\.0$/, ""), unit: "ty" };
  if (price >= 1e6) return { formatted: String(Math.round(price / 1e6)), unit: "trieu" };
  return { formatted: String(price), unit: "trieu" };
}

const FEATURE_KW = [
  [/hồ bơi|bể bơi/i, "Hồ bơi"], [/gym|phòng tập/i, "Phòng gym"],
  [/bảo vệ|an ninh/i, "Bảo vệ 24/7"], [/thang máy/i, "Thang máy"],
  [/ban công/i, "Ban công"], [/sân vườn/i, "Sân vườn"],
  [/gara|garage|đỗ xe/i, "Bãi đỗ xe"], [/điều hòa|máy lạnh/i, "Điều hòa"],
  [/nội thất/i, "Nội thất cao cấp"], [/view sông/i, "View sông"],
];

async function fetchPage(cg, region, offset) {
  const url = `${API_BASE}?cg=${cg}&limit=${BATCH_SIZE}&o=${offset}&region_v2=${region}&sort_by=date&date=-1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", Accept: "application/json" },
    });
    if (!res.ok) { if (res.status === 429) { await sleep(5000); return fetchPage(cg, region, offset); } return []; }
    return (await res.json()).ads || [];
  } catch { return []; }
}

function transform(ad, catType, city) {
  const images = [];
  (ad.images || []).slice(0, 6).forEach(img => {
    if (typeof img === "string") images.push(img);
    else if (img?.image) images.push(img.image);
  });
  if (!images.length && ad.image) images.push(ad.image);
  if (!images.length) return null;

  const price = ad.price || 0;
  if (price <= 0) return null;

  const { formatted, unit } = formatPrice(price);
  const parts = [ad.street_name, ad.ward_name_v3 || ad.ward_name, ad.area_name].filter(Boolean);
  const desc = (ad.body || "").substring(0, 5000) || null;

  let category = ad.type === "k" ? "rent" : "sale";
  let type = catType;
  if (type === "nha-pho" && price >= 10e9 && (ad.size || 0) >= 200) type = "biet-thu";
  if (type === "phong-tro") category = "rent";

  let priceUnit = unit;
  if (category === "rent" && price < 100e6) priceUnit = "trieu/thang";

  const title = (ad.subject || `BĐS ${city}`).substring(0, 500);
  return {
    title, slug: `${slugify(title)}-${ad.list_id || Date.now()}`,
    price, price_formatted: formatted, price_unit: priceUnit,
    type, category, status: "published",
    address: parts.join(", ") || null, district: ad.area_name || null, city,
    bedrooms: Math.round(ad.rooms || ad.number_of_room || 0),
    bathrooms: Math.round(ad.toilets || ad.number_of_toilet || 0),
    area: Math.round(ad.size || ad.area || 0),
    floor: ad.floors ? Math.round(ad.floors) : null,
    direction: null, description: desc,
    images, features: FEATURE_KW.filter(([kw]) => kw.test(desc || "")).map(([,f]) => f),
    is_featured: Math.random() < 0.03,
    views_count: Math.floor(20 + Math.random() * 350),
    contact_name: (ad.account_name || "").substring(0, 100) || null,
    contact_phone: ad.phone || null,
    created_days_ago: Math.floor(Math.random() * 45),
  };
}

async function main() {
  console.log("=== Deep Crawl HCM + HN ===\n");
  const all = []; const seen = new Set(existingSlugs);
  const TARGET = 2000;

  for (const cat of CATEGORIES) {
    for (const reg of REGIONS) {
      // Start from offset 300 (skip what we already crawled)
      const startOffset = 300;
      const maxOffset = Math.min(cat.total, 2000); // don't go past 2000

      process.stdout.write(`[${cat.type}] ${reg.name} (${startOffset}-${maxOffset}): `);

      for (let offset = startOffset; offset < maxOffset; offset += BATCH_SIZE) {
        const ads = await fetchPage(cat.cg, reg.code, offset);
        if (!ads.length) break;

        let added = 0;
        for (const ad of ads) {
          const t = transform(ad, cat.type, reg.name);
          if (!t || seen.has(t.title)) continue;
          seen.add(t.title); all.push(t); added++;
        }
        process.stdout.write(`${added} `);
        await sleep(DELAY_MS);

        if (all.length >= TARGET) break;
      }
      console.log(`→ ${all.length}`);
      if (all.length >= TARGET) break;
    }
    if (all.length >= TARGET) break;
  }

  // Stats
  const byType = {}, byCat = {}, byCity = {};
  for (const l of all) {
    byType[l.type] = (byType[l.type] || 0) + 1;
    byCat[l.category] = (byCat[l.category] || 0) + 1;
    byCity[l.city] = (byCity[l.city] || 0) + 1;
  }
  console.log(`\nTotal NEW: ${all.length}`);
  console.log("Type:", JSON.stringify(byType));
  console.log("Category:", JSON.stringify(byCat));
  console.log("City:", JSON.stringify(byCity));

  writeFileSync("deep-crawl.json", JSON.stringify(all));
  console.log(`Saved to deep-crawl.json`);
}

main().catch(console.error);
