import { writeFileSync } from "fs";

const API_BASE = "https://gateway.chotot.com/v1/public/ad-listing";
const BATCH_SIZE = 50;
const MAX_PER_COMBO = 150;
const DELAY_MS = 600;

const CATEGORIES = [
  { cg: 1020, label: "Nhà ở" },
  { cg: 1010, label: "Căn hộ/Chung cư" },
  { cg: 1040, label: "Văn phòng" },
  { cg: 1030, label: "Đất nền" },
];

const REGIONS = [
  { code: 13000, name: "TP.HCM" },
  { code: 12000, name: "Hà Nội" },
  { code: 51000, name: "Đà Nẵng" },
  { code: 43000, name: "Cần Thơ" },
  { code: 15000, name: "Hải Phòng" },
  { code: 48000, name: "Bình Dương" },
  { code: 49000, name: "Đồng Nai" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchPage(cg, region, offset) {
  const url = `${API_BASE}?cg=${cg}&limit=${BATCH_SIZE}&o=${offset}&st=s,k&region_v2=${region}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0", Accept: "application/json" },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.ads || [];
  } catch { return []; }
}

function transform(ad, category, city) {
  const images = (ad.images || []).slice(0, 6);
  if (images.length === 0 && ad.image) images.push(ad.image);
  const parts = [ad.street_name, ad.ward_name_v3 || ad.ward_name, ad.area_name].filter(Boolean);

  return {
    title: (ad.subject || `${category} ${ad.area_name || city}`).substring(0, 500),
    description: (ad.body || "").substring(0, 5000) || null,
    price: ad.price || 0,
    address: parts.join(", ") || null,
    district: ad.area_name || null,
    city,
    province: city,
    category,
    area: ad.size || ad.area || null,
    images,
    status: "approved",
    is_verified: Math.random() > 0.7,
    is_vip: Math.random() > 0.85,
    contact_name: (ad.account_name || ad.full_name || "Chủ nhà").substring(0, 100),
    contact_phone: `09${Math.floor(10000000 + Math.random() * 89999999)}`,
    rent_price: ad.price ? Math.round((ad.price * (0.003 + Math.random() * 0.005)) / 1000000) * 1000000 : null,
    transaction_type: ad.type === "k" ? "cho-thue" : "sang-nhuong",
    views: Math.floor(Math.random() * 500),
  };
}

async function main() {
  console.log("=== Crawling to JSON ===");
  const all = [];

  for (const cat of CATEGORIES) {
    for (const region of REGIONS) {
      process.stdout.write(`[${cat.label}] ${region.name}: `);
      let offset = 0;
      while (offset < MAX_PER_COMBO) {
        const ads = await fetchPage(cat.cg, region.code, offset);
        if (ads.length === 0) break;
        ads.forEach((ad) => all.push(transform(ad, cat.label, region.name)));
        process.stdout.write(`${ads.length} `);
        offset += BATCH_SIZE;
        await sleep(DELAY_MS);
      }
      console.log(`(${all.length} total)`);
    }
  }

  writeFileSync("listings.json", JSON.stringify(all, null, 0));
  console.log(`\nSaved ${all.length} listings to listings.json`);
}

main().catch(console.error);
