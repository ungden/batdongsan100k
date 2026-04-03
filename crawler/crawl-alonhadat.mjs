import { writeFileSync } from "fs";
import * as cheerio from "cheerio";

// Alonhadat.com.vn HTML scraper
const BASE = "https://alonhadat.com.vn";
const DELAY_MS = 800;

// Pages to crawl
const PAGES = [
  { path: "/nha-dat-ban", category: "sale", label: "Mua bán" },
  { path: "/nha-dat-cho-thue", category: "rent", label: "Cho thuê" },
  { path: "/can-ho-chung-cu", category: "sale", label: "Chung cư bán" },
  { path: "/nha-dat-ban/can-ho", category: "sale", label: "Căn hộ bán" },
  { path: "/nha-dat-ban/nha-rieng", category: "sale", label: "Nhà riêng" },
  { path: "/nha-dat-ban/biet-thu", category: "sale", label: "Biệt thự" },
  { path: "/nha-dat-ban/dat-nen", category: "sale", label: "Đất nền" },
  { path: "/nha-dat-cho-thue/phong-tro", category: "rent", label: "Phòng trọ" },
  { path: "/nha-dat-cho-thue/can-ho", category: "rent", label: "Căn hộ thuê" },
  { path: "/nha-dat-cho-thue/nha-rieng", category: "rent", label: "Nhà thuê" },
  { path: "/nha-dat-cho-thue/mat-bang", category: "rent", label: "Mặt bằng" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-")
    .replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 200);
}

function detectType(path, title, price) {
  const t = (title || "").toLowerCase();
  if (path.includes("can-ho") || path.includes("chung-cu") || t.includes("chung cư") || t.includes("căn hộ")) return "chung-cu";
  if (path.includes("biet-thu") || t.includes("biệt thự")) return "biet-thu";
  if (path.includes("dat-nen") || t.includes("đất") || t.includes("đất nền")) return "dat-nen";
  if (path.includes("phong-tro") || t.includes("phòng trọ")) return "phong-tro";
  if (path.includes("mat-bang") || t.includes("mặt bằng") || t.includes("văn phòng")) return "van-phong";
  if (t.includes("nhà") || t.includes("nhà phố") || t.includes("nhà riêng")) return "nha-pho";
  return "nha-pho";
}

function parsePrice(priceText) {
  if (!priceText) return { price: 0, formatted: "0", unit: "ty" };
  const text = priceText.trim().toLowerCase();

  // "3.5 tỷ", "850 triệu", "15 triệu/tháng"
  const tyMatch = text.match(/([\d.,]+)\s*tỷ/);
  if (tyMatch) {
    const val = parseFloat(tyMatch[1].replace(",", "."));
    return { price: val * 1e9, formatted: String(val), unit: "ty" };
  }
  const trieuMatch = text.match(/([\d.,]+)\s*triệu/);
  if (trieuMatch) {
    const val = parseFloat(trieuMatch[1].replace(",", "."));
    const isMonth = text.includes("tháng") || text.includes("/th");
    return { price: val * 1e6, formatted: String(Math.round(val)), unit: isMonth ? "trieu/thang" : "trieu" };
  }
  return { price: 0, formatted: "0", unit: "ty" };
}

function parseArea(areaText) {
  if (!areaText) return 0;
  const match = areaText.match(/([\d.,]+)\s*m/);
  return match ? Math.round(parseFloat(match[1].replace(",", "."))) : 0;
}

async function fetchHTML(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "vi-VN,vi;q=0.9,en;q=0.8",
      },
    });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function scrapeListPage(pagePath, pageNum) {
  const url = pageNum > 1 ? `${BASE}${pagePath}/trang-${pageNum}.html` : `${BASE}${pagePath}.html`;
  const html = await fetchHTML(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const items = [];

  // Alonhadat listing structure
  $(".content-item").each((_, el) => {
    const $el = $(el);
    const titleEl = $el.find(".ct_title a, h3 a, .title a");
    const title = titleEl.text().trim();
    const detailUrl = titleEl.attr("href");
    const priceEl = $el.find(".ct_price, .price, span.price");
    const priceText = priceEl.first().text().trim();
    const areaEl = $el.find(".ct_dt, .area, span.area");
    const areaText = areaEl.first().text().trim();
    const locationEl = $el.find(".ct_dis, .address, .location");
    const location = locationEl.first().text().trim();
    const imgEl = $el.find("img").first();
    const imgSrc = imgEl.attr("data-src") || imgEl.attr("src") || "";
    const desc = $el.find(".ct_brief, .description, p").first().text().trim();

    if (title && title.length > 5) {
      items.push({ title, detailUrl, priceText, areaText, location, imgSrc, desc });
    }
  });

  return items;
}

function parseLocation(locationText) {
  const cities = ["Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Bình Dương", "Đồng Nai", "Khánh Hòa",
    "Hải Phòng", "Cần Thơ", "Bà Rịa Vũng Tàu", "Long An", "Thanh Hóa", "Quảng Ninh",
    "Nghệ An", "Thái Nguyên", "Lâm Đồng", "Bắc Ninh", "Hưng Yên"];

  let city = "Khác";
  let district = "";

  for (const c of cities) {
    if (locationText.includes(c)) { city = c; break; }
  }

  // Try extract district
  const parts = locationText.split(",").map(s => s.trim());
  if (parts.length >= 2) district = parts[parts.length - 2];

  return { city, district };
}

async function main() {
  console.log("=== Alonhadat.com.vn Scraper ===\n");
  const all = [];
  const seen = new Set();
  const MAX_PAGES_PER_SECTION = 3;

  for (const section of PAGES) {
    process.stdout.write(`[${section.label}]: `);

    for (let page = 1; page <= MAX_PAGES_PER_SECTION; page++) {
      const items = await scrapeListPage(section.path, page);
      if (!items.length) break;

      let added = 0;
      for (const item of items) {
        if (seen.has(item.title)) continue;
        seen.add(item.title);

        const { price, formatted, unit } = parsePrice(item.priceText);
        if (price <= 0) continue;

        const area = parseArea(item.areaText);
        const { city, district } = parseLocation(item.location);
        const type = detectType(section.path, item.title, price);

        const images = [];
        if (item.imgSrc && !item.imgSrc.includes("placeholder") && !item.imgSrc.includes("no-image")) {
          let img = item.imgSrc;
          if (img.startsWith("//")) img = "https:" + img;
          else if (img.startsWith("/")) img = BASE + img;
          images.push(img);
        }

        const listing = {
          title: item.title.substring(0, 500),
          slug: `${slugify(item.title)}-ald-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          price, price_formatted: formatted, price_unit: unit,
          type, category: section.category, status: "published",
          address: item.location || null, district: district || null, city,
          bedrooms: 0, bathrooms: 0, area, floor: null, direction: null,
          description: (item.desc || "").substring(0, 5000) || null,
          images, features: [],
          is_featured: Math.random() < 0.03,
          views_count: Math.floor(20 + Math.random() * 300),
          contact_name: null, contact_phone: null,
          created_days_ago: Math.floor(Math.random() * 30),
          source: "alonhadat",
        };

        all.push(listing);
        added++;
      }

      process.stdout.write(`${added} `);
      await sleep(DELAY_MS);
      if (all.length >= 1500) break;
    }
    console.log(`→ ${all.length}`);
    if (all.length >= 1500) break;
  }

  // Stats
  const byType = {}, byCat = {}, byCity = {};
  for (const l of all) {
    byType[l.type] = (byType[l.type] || 0) + 1;
    byCat[l.category] = (byCat[l.category] || 0) + 1;
    byCity[l.city] = (byCity[l.city] || 0) + 1;
  }
  console.log(`\nTotal: ${all.length}`);
  console.log("Type:", JSON.stringify(byType));
  console.log("Category:", JSON.stringify(byCat));
  console.log("City:", JSON.stringify(byCity));

  writeFileSync("alonhadat-listings.json", JSON.stringify(all));
  console.log(`Saved to alonhadat-listings.json`);
}

main().catch(console.error);
