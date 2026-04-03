import { writeFileSync } from "fs";

const API_BASE = "https://gateway.chotot.com/v1/public/ad-listing";
const BATCH_SIZE = 50;
const DELAY_MS = 600;

// Property type mapping: Chotot cg → our PropertyType
const CATEGORIES = [
  { cg: 1010, label: "Căn hộ/Chung cư", type: "chung-cu" },
  { cg: 1020, label: "Nhà ở", type: "nha-pho" }, // default nha-pho, upgrade to biet-thu if expensive+large
  { cg: 1030, label: "Đất nền", type: "dat-nen" },
  { cg: 1040, label: "Văn phòng", type: "van-phong" },
  { cg: 1050, label: "Phòng trọ", type: "phong-tro" },
  { cg: 1060, label: "Kho/Nhà xưởng", type: "kho-xuong" },
];

// Transaction types: s=bán, k=thuê
const SALE_TYPES = [
  { st: "s", category: "sale" },
  { st: "k", category: "rent" },
];

// Regions
const REGIONS = [
  { code: 13000, name: "Hồ Chí Minh", pages: 4 },
  { code: 12000, name: "Hà Nội", pages: 4 },
  { code: 51000, name: "Đà Nẵng", pages: 2 },
  { code: 43000, name: "Cần Thơ", pages: 1 },
  { code: 15000, name: "Hải Phòng", pages: 1 },
  { code: 48000, name: "Bình Dương", pages: 2 },
  { code: 49000, name: "Đồng Nai", pages: 1 },
  { code: 46000, name: "Khánh Hòa", pages: 1 },
  { code: 50000, name: "Bà Rịa Vũng Tàu", pages: 1 },
  { code: 56000, name: "Long An", pages: 1 },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 200);
}

function formatPrice(price) {
  if (!price || price <= 0) return { formatted: "0", unit: "ty" };
  if (price >= 1_000_000_000) {
    const ty = price / 1_000_000_000;
    return { formatted: ty % 1 === 0 ? String(ty) : ty.toFixed(1), unit: "ty" };
  }
  if (price >= 1_000_000) {
    const trieu = Math.round(price / 1_000_000);
    return { formatted: String(trieu), unit: "trieu" };
  }
  return { formatted: String(price), unit: "trieu" };
}

// Parse features from description text
const FEATURE_KEYWORDS = [
  { keyword: /hồ bơi|bể bơi|swimming/i, feature: "Hồ bơi" },
  { keyword: /gym|phòng tập/i, feature: "Phòng gym" },
  { keyword: /bảo vệ|an ninh|security/i, feature: "Bảo vệ 24/7" },
  { keyword: /thang máy|elevator/i, feature: "Thang máy" },
  { keyword: /ban công|balcon/i, feature: "Ban công" },
  { keyword: /sân vườn|garden/i, feature: "Sân vườn" },
  { keyword: /gara|garage|đỗ xe|parking/i, feature: "Bãi đỗ xe" },
  { keyword: /điều hòa|máy lạnh/i, feature: "Điều hòa" },
  { keyword: /nội thất|full nội thất|đầy đủ nội thất/i, feature: "Nội thất cao cấp" },
  { keyword: /view sông|ven sông/i, feature: "View sông" },
  { keyword: /gần trường|trường học/i, feature: "Gần trường học" },
];

function parseFeatures(text) {
  if (!text) return [];
  const found = [];
  for (const { keyword, feature } of FEATURE_KEYWORDS) {
    if (keyword.test(text)) found.push(feature);
  }
  return found;
}

// Detect direction from description
function parseDirection(text) {
  if (!text) return null;
  const dirs = ["Đông Nam", "Tây Bắc", "Đông Bắc", "Tây Nam", "Đông", "Tây", "Nam", "Bắc"];
  for (const d of dirs) {
    if (text.includes(`hướng ${d}`) || text.includes(`Hướng ${d}`)) return d;
  }
  return null;
}

async function fetchPage(cg, region, offset, st) {
  const url = `${API_BASE}?cg=${cg}&limit=${BATCH_SIZE}&o=${offset}&st=${st}&region_v2=${region}&sort_by=date&date=-1`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", Accept: "application/json" },
    });
    if (!res.ok) {
      if (res.status === 429) {
        console.log(" [rate limited, waiting 3s]");
        await sleep(3000);
        return fetchPage(cg, region, offset, st); // retry once
      }
      return [];
    }
    const data = await res.json();
    return data.ads || [];
  } catch (e) {
    console.error(` [fetch error: ${e.message}]`);
    return [];
  }
}

function transform(ad, catInfo, city, saleCategory) {
  // Images
  const images = [];
  if (ad.images && ad.images.length > 0) {
    ad.images.slice(0, 6).forEach((img) => {
      if (typeof img === "string") images.push(img);
      else if (img.image) images.push(img.image);
    });
  }
  if (images.length === 0 && ad.image) images.push(ad.image);
  if (images.length === 0) return null; // skip no-image listings

  // Address
  const parts = [ad.street_name, ad.ward_name_v3 || ad.ward_name, ad.area_name].filter(Boolean);
  const address = parts.join(", ") || null;
  const district = ad.area_name || null;

  // Price
  const price = ad.price || 0;
  if (price <= 0) return null; // skip free/unknown price

  const { formatted, unit } = formatPrice(price);

  // Determine property type
  let type = catInfo.type;
  // Upgrade nha-pho → biet-thu for expensive large houses
  if (type === "nha-pho" && price >= 10_000_000_000 && (ad.size || 0) >= 200) {
    type = "biet-thu";
  }

  // Category override for phong-tro (always rent)
  let category = saleCategory;
  if (type === "phong-tro") category = "rent";
  // For rent listings, use rent price unit
  let priceUnit = unit;
  if (category === "rent") priceUnit = "trieu/thang";

  // Description & features
  const description = (ad.body || "").substring(0, 5000) || null;
  const features = parseFeatures(description);
  const direction = parseDirection(description);

  // Bedrooms/bathrooms from ad params
  const bedrooms = ad.rooms || ad.number_of_room || 0;
  const bathrooms = ad.toilets || ad.number_of_toilet || 0;
  const area = ad.size || ad.area || 0;
  const floor = ad.floors || ad.number_of_floor || null;

  const title = (ad.subject || `${catInfo.label} ${district || city}`).substring(0, 500);
  const baseSlug = slugify(title);
  const slug = `${baseSlug}-${ad.list_id || Date.now()}`;

  return {
    title,
    slug,
    price,
    price_formatted: formatted,
    price_unit: priceUnit,
    type,
    category,
    status: "published",
    address,
    district,
    city,
    bedrooms: Math.round(bedrooms),
    bathrooms: Math.round(bathrooms),
    area: area ? Math.round(area) : 0,
    floor: floor ? Math.round(floor) : null,
    direction,
    description,
    images,
    features,
    is_featured: Math.random() < 0.05, // 5% featured
    views_count: Math.floor(50 + Math.random() * 450),
    contact_name: (ad.account_name || ad.full_name || "").substring(0, 100) || null,
    contact_phone: ad.phone || null,
    created_days_ago: Math.floor(Math.random() * 30), // random within 30 days
  };
}

async function main() {
  console.log("=== BatDongSan100K Crawler ===");
  console.log("Target: ~2000 listings from Chotot API\n");

  const all = [];
  const seen = new Set();
  let requestCount = 0;

  for (const cat of CATEGORIES) {
    for (const st of SALE_TYPES) {
      // Skip nonsensical combinations
      if (cat.type === "dat-nen" && st.category === "rent") continue; // no renting land
      if (cat.type === "phong-tro" && st.category === "sale") continue; // no buying rooms

      for (const region of REGIONS) {
        const maxPages = region.pages;
        process.stdout.write(`[${cat.label}/${st.category}] ${region.name} (${maxPages}p): `);
        let offset = 0;
        let pages = 0;

        while (pages < maxPages) {
          const ads = await fetchPage(cat.cg, region.code, offset, st.st);
          requestCount++;
          if (ads.length === 0) break;

          let added = 0;
          for (const ad of ads) {
            const t = transform(ad, cat, region.name, st.category);
            if (!t) continue;
            if (seen.has(t.title)) continue;
            seen.add(t.title);
            all.push(t);
            added++;
          }

          process.stdout.write(`${added} `);
          offset += BATCH_SIZE;
          pages++;
          await sleep(DELAY_MS);

          // Early exit if we have enough
          if (all.length >= 2500) break;
        }
        console.log(`→ total: ${all.length}`);
        if (all.length >= 2500) break;
      }
      if (all.length >= 2500) break;
    }
    if (all.length >= 2500) break;
  }

  // Stats
  console.log(`\n=== Stats ===`);
  console.log(`Total requests: ${requestCount}`);
  console.log(`Total unique listings: ${all.length}`);
  console.log(`With images: ${all.filter((l) => l.images.length > 0).length}`);
  console.log(`Avg images: ${(all.reduce((s, l) => s + l.images.length, 0) / all.length).toFixed(1)}`);

  // By type
  const byType = {};
  for (const l of all) byType[l.type] = (byType[l.type] || 0) + 1;
  console.log(`\nBy type:`);
  for (const [k, v] of Object.entries(byType).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  // By category
  const byCat = {};
  for (const l of all) byCat[l.category] = (byCat[l.category] || 0) + 1;
  console.log(`\nBy category:`);
  for (const [k, v] of Object.entries(byCat)) console.log(`  ${k}: ${v}`);

  // By city
  const byCity = {};
  for (const l of all) byCity[l.city] = (byCity[l.city] || 0) + 1;
  console.log(`\nBy city:`);
  for (const [k, v] of Object.entries(byCity).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${k}: ${v}`);
  }

  writeFileSync("batdongsan-listings.json", JSON.stringify(all, null, 0));
  console.log(`\nSaved to batdongsan-listings.json (${(JSON.stringify(all).length / 1024 / 1024).toFixed(1)} MB)`);
}

main().catch(console.error);
