import { writeFileSync } from "fs";

const API_BASE = "https://gateway.chotot.com/v1/public/ad-listing";
const BATCH_SIZE = 50;
const DELAY_MS = 500;

// More categories + subcategories
const CATEGORIES = [
  { cg: 1020, label: "Nhà ở" },
  { cg: 1010, label: "Căn hộ/Chung cư" },
  { cg: 1040, label: "Văn phòng" },
  { cg: 1030, label: "Đất nền" },
  { cg: 1050, label: "Phòng trọ" },
  { cg: 1060, label: "Kho/Nhà xưởng" },
];

// More regions - major cities + provinces
const REGIONS = [
  { code: 13000, name: "TP.HCM", pages: 6 },
  { code: 12000, name: "Hà Nội", pages: 6 },
  { code: 51000, name: "Đà Nẵng", pages: 3 },
  { code: 43000, name: "Cần Thơ", pages: 2 },
  { code: 15000, name: "Hải Phòng", pages: 2 },
  { code: 48000, name: "Bình Dương", pages: 3 },
  { code: 49000, name: "Đồng Nai", pages: 2 },
  { code: 38000, name: "Thanh Hóa", pages: 1 },
  { code: 46000, name: "Khánh Hòa", pages: 2 },
  { code: 50000, name: "Bà Rịa Vũng Tàu", pages: 2 },
  { code: 35000, name: "Quảng Ninh", pages: 1 },
  { code: 56000, name: "Long An", pages: 1 },
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
  } catch {
    return [];
  }
}

function transform(ad, category, city) {
  // Get REAL images from the ad - keep all of them
  const images = (ad.images || []).slice(0, 6);
  if (images.length === 0 && ad.image) {
    // Use the main image if no images array
    images.push(ad.image);
  }
  // Also try thumbnails as fallback
  if (images.length === 0 && ad.image_thumbnails?.length > 0) {
    ad.image_thumbnails.forEach((t) => {
      if (t.image) images.push(t.image);
    });
  }

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
    images, // REAL IMAGES from Chotot
    status: "approved",
    is_verified: Math.random() > 0.7,
    is_vip: Math.random() > 0.85,
    contact_name: (ad.account_name || ad.full_name || "Chủ nhà").substring(0, 100),
    contact_phone: ad.phone || `09${Math.floor(10000000 + Math.random() * 89999999)}`,
    rent_price: ad.price ? Math.round((ad.price * (0.003 + Math.random() * 0.005)) / 1000000) * 1000000 : null,
    transaction_type: ad.type === "k" ? "cho-thue" : "sang-nhuong",
    views: Math.floor(Math.random() * 500),
  };
}

async function main() {
  console.log("=== Crawling REAL data with REAL images ===\n");
  const all = [];
  const seen = new Set(); // dedup by title

  for (const cat of CATEGORIES) {
    for (const region of REGIONS) {
      const maxPages = region.pages;
      process.stdout.write(`[${cat.label}] ${region.name} (${maxPages}p): `);
      let offset = 0;
      let pages = 0;

      while (pages < maxPages) {
        const ads = await fetchPage(cat.cg, region.code, offset);
        if (ads.length === 0) break;

        for (const ad of ads) {
          const t = transform(ad, cat.label, region.name);
          // Skip if no images or duplicate title
          if (t.images.length === 0) continue;
          if (seen.has(t.title)) continue;
          seen.add(t.title);
          all.push(t);
        }

        process.stdout.write(`${ads.length} `);
        offset += BATCH_SIZE;
        pages++;
        await sleep(DELAY_MS);
      }
      console.log(`→ ${all.length} total`);
    }
  }

  // Stats
  const withImages = all.filter((l) => l.images.length > 0).length;
  const avgImages = all.reduce((s, l) => s + l.images.length, 0) / all.length;
  console.log(`\n=== Stats ===`);
  console.log(`Total unique listings: ${all.length}`);
  console.log(`With images: ${withImages} (${((withImages / all.length) * 100).toFixed(1)}%)`);
  console.log(`Avg images per listing: ${avgImages.toFixed(1)}`);

  writeFileSync("listings-real.json", JSON.stringify(all));
  console.log(`\nSaved to listings-real.json`);
}

main().catch(console.error);
