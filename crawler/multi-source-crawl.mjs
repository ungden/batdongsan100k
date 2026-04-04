import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";
const DEFAULT_PAGES = 1;
const DEFAULT_PER_SOURCE = 12;
const DEFAULT_IMAGE_LIMIT = 4;
const DEFAULT_DELAY_MS = 400;
const DEFAULT_MAX_AGE_DAYS = 30;
const DEFAULT_MAX_PAGES = 60;
const DEFAULT_STALE_PAGE_THRESHOLD = 2;

const CHOTOT_CATEGORIES = [
  { cg: 1010, label: "Căn hộ/Chung cư", type: "chung-cu" },
  { cg: 1020, label: "Nhà ở", type: "nha-pho" },
  { cg: 1030, label: "Đất nền", type: "dat-nen" },
  { cg: 1040, label: "Văn phòng", type: "van-phong" },
  { cg: 1050, label: "Phòng trọ", type: "phong-tro" },
  { cg: 1060, label: "Kho/Nhà xưởng", type: "kho-xuong" },
];

const CHOTOT_SALE_TYPES = [
  { st: "s", category: "sale" },
  { st: "k", category: "rent" },
];

const CHOTOT_REGIONS = [
  { code: 13000, name: "Hồ Chí Minh" },
  { code: 12000, name: "Hà Nội" },
  { code: 51000, name: "Đà Nẵng" },
  { code: 43000, name: "Cần Thơ" },
  { code: 15000, name: "Hải Phòng" },
  { code: 48000, name: "Bình Dương" },
  { code: 49000, name: "Đồng Nai" },
  { code: 46000, name: "Khánh Hòa" },
  { code: 50000, name: "Bà Rịa Vũng Tàu" },
  { code: 56000, name: "Long An" },
];

const HTML_SOURCES = [
  {
    key: "alonhadat",
    category: "sale",
    baseUrl: "https://alonhadat.com.vn/can-ban-nha-dat",
    detailFetch: false,
  },
  {
    key: "alonhadat",
    category: "rent",
    baseUrl: "https://alonhadat.com.vn/cho-thue-nha-dat",
    detailFetch: false,
  },
  {
    key: "homedy",
    category: "sale",
    baseUrl: "https://homedy.com/ban-nha-dat",
    detailFetch: true,
  },
  {
    key: "homedy",
    category: "rent",
    baseUrl: "https://homedy.com/cho-thue-nha-dat",
    detailFetch: true,
  },
  {
    key: "meeyland",
    category: "sale",
    baseUrl: "https://meeyland.com/mua-ban-nha-dat-a4",
    detailFetch: true,
  },
  {
    key: "meeyland",
    category: "rent",
    baseUrl: "https://meeyland.com/cho-thue-nha-dat-a4",
    detailFetch: true,
  },
  {
    key: "mogi",
    category: "sale",
    baseUrl: "https://mogi.vn/mua-nha-dat",
    detailFetch: true,
  },
  {
    key: "mogi",
    category: "rent",
    baseUrl: "https://mogi.vn/thue-nha-dat",
    detailFetch: true,
  },
  {
    key: "odt",
    category: "sale",
    baseUrl: "https://odt.vn/nha-dat-ban",
    detailFetch: true,
  },
  {
    key: "odt",
    category: "rent",
    baseUrl: "https://odt.vn/nha-dat-cho-thue",
    detailFetch: true,
  },
  {
    key: "muonnha",
    category: "sale",
    baseUrl: "https://muonnha.com.vn/nha-dat-ban",
    detailFetch: true,
  },
  {
    key: "muonnha",
    category: "rent",
    baseUrl: "https://muonnha.com.vn/nha-dat-cho-thue",
    detailFetch: true,
  },
  {
    key: "cafeland",
    category: "sale",
    baseUrl: "https://nhadat.cafeland.vn/nha-dat-ban/",
    detailFetch: true,
  },
  {
    key: "cafeland",
    category: "rent",
    baseUrl: "https://nhadat.cafeland.vn/cho-thue/",
    detailFetch: true,
  },
];

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

function parseArgs(argv) {
  const args = {
    pages: DEFAULT_PAGES,
    perSource: DEFAULT_PER_SOURCE,
    imageLimit: DEFAULT_IMAGE_LIMIT,
    delayMs: DEFAULT_DELAY_MS,
    maxAgeDays: DEFAULT_MAX_AGE_DAYS,
    maxPages: DEFAULT_MAX_PAGES,
    stalePageThreshold: DEFAULT_STALE_PAGE_THRESHOLD,
    crawlAllRecent: argv.includes("--crawl-all-recent"),
    downloadImages: argv.includes("--download-images"),
    sources: null,
    outDir: null,
  };

  for (const raw of argv) {
    if (raw.startsWith("--pages=")) args.pages = Number(raw.split("=")[1]) || DEFAULT_PAGES;
    if (raw.startsWith("--per-source=")) args.perSource = Number(raw.split("=")[1]) || DEFAULT_PER_SOURCE;
    if (raw.startsWith("--image-limit=")) args.imageLimit = Number(raw.split("=")[1]) || DEFAULT_IMAGE_LIMIT;
    if (raw.startsWith("--delay-ms=")) args.delayMs = Number(raw.split("=")[1]) || DEFAULT_DELAY_MS;
    if (raw.startsWith("--max-age-days=")) args.maxAgeDays = Number(raw.split("=")[1]) || DEFAULT_MAX_AGE_DAYS;
    if (raw.startsWith("--max-pages=")) args.maxPages = Number(raw.split("=")[1]) || DEFAULT_MAX_PAGES;
    if (raw.startsWith("--stale-page-threshold=")) args.stalePageThreshold = Number(raw.split("=")[1]) || DEFAULT_STALE_PAGE_THRESHOLD;
    if (raw.startsWith("--sources=")) args.sources = raw.split("=")[1].split(",").map((item) => item.trim()).filter(Boolean);
    if (raw.startsWith("--out-dir=")) args.outDir = raw.split("=")[1] || null;
  }

  return args;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function slugify(text) {
  return normalizeWhitespace(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 200);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseExactDate(text) {
  const value = normalizeWhitespace(text);
  const isoMatch = value.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  const dmyMatch = value.match(/(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
  if (dmyMatch) {
    const [, day, month, yearRaw] = dmyMatch;
    const year = yearRaw.length === 2 ? Number(`20${yearRaw}`) : Number(yearRaw);
    if (year < 2020 || Number(month) > 12 || Number(day) > 31) return null;
    return new Date(year, Number(month) - 1, Number(day));
  }

  return null;
}

function parseRelativeDate(text, now = new Date()) {
  const value = normalizeWhitespace(text).toLowerCase();
  if (!value) return null;
  if (value.includes("hôm nay")) return startOfDay(now);
  if (value.includes("hôm qua")) {
    const date = new Date(now);
    date.setDate(date.getDate() - 1);
    return startOfDay(date);
  }

  const match = value.match(/(\d+)\s*(phút|giờ|ngày|tuần|tháng)\s*trước/);
  if (!match) return null;

  const amount = Number(match[1]);
  const unit = match[2];
  const date = new Date(now);
  if (unit === "phút" || unit === "giờ") {
    return startOfDay(date);
  }
  if (unit === "ngày") {
    date.setDate(date.getDate() - amount);
    return startOfDay(date);
  }
  if (unit === "tuần") {
    date.setDate(date.getDate() - amount * 7);
    return startOfDay(date);
  }
  if (unit === "tháng") {
    date.setMonth(date.getMonth() - amount);
    return startOfDay(date);
  }

  return null;
}

function parsePublishedAt(text, now = new Date()) {
  return parseExactDate(text) || parseRelativeDate(text, now);
}

function pickRecentDate(dates, maxAgeDays, now = new Date()) {
  const normalized = dates
    .map((date) => (date instanceof Date ? date : new Date(date)))
    .filter((date) => Number.isFinite(date.getTime()))
    .filter((date) => isRecentEnough(date, maxAgeDays, now))
    .sort((a, b) => b.getTime() - a.getTime());

  return normalized[0] || null;
}

function ageInDays(date, now = new Date()) {
  if (!date) return null;
  const diff = startOfDay(now).getTime() - startOfDay(date).getTime();
  return Math.floor(diff / 86400000);
}

function isRecentEnough(date, maxAgeDays, now = new Date()) {
  const age = ageInDays(date, now);
  return age !== null && age >= 0 && age <= maxAgeDays;
}

function formatDisplayDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatRecencyLabel(date, now = new Date()) {
  const age = ageInDays(date, now);
  if (age === null) return null;
  if (age === 0) return "Hôm nay";
  if (age === 1) return "Hôm qua";
  if (age < 7) return `${age} ngày trước`;
  if (age < 30) return `${Math.floor(age / 7)} tuần trước`;
  return formatDisplayDate(date);
}

function freshnessBucket(age) {
  if (age === null) return null;
  if (age === 0) return "today";
  if (age === 1) return "yesterday";
  if (age <= 3) return "last_3_days";
  if (age <= 7) return "last_week";
  if (age <= 14) return "last_2_weeks";
  if (age <= 30) return "last_month";
  return "stale";
}

function freshnessRank(age) {
  if (age === null) return null;
  if (age === 0) return 100;
  if (age === 1) return 95;
  if (age <= 3) return 90;
  if (age <= 7) return 80;
  if (age <= 14) return 65;
  if (age <= 30) return 50;
  return 0;
}

function absoluteUrl(base, href) {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function inferType(text) {
  const value = normalizeWhitespace(text).toLowerCase();
  const withoutDomains = value.replace(/https?:\/\/[^\s]+/g, (url) => {
    try {
      return new URL(url).pathname.toLowerCase();
    } catch {
      return url;
    }
  });
  if (/chung cư|can ho|căn hộ|apartment/.test(withoutDomains)) return "chung-cu";
  if (/biệt thự|biet thu|villa/.test(withoutDomains)) return "biet-thu";
  if (/đất|dat nen|đất nền|\bland\b/.test(withoutDomains)) return "dat-nen";
  if (/phòng trọ|nhà trọ|phong tro|\broom\b/.test(withoutDomains)) return "phong-tro";
  if (/văn phòng|van phong|office/.test(withoutDomains)) return "van-phong";
  if (/kho|xưởng|xuong|warehouse|factory/.test(withoutDomains)) return "kho-xuong";
  return "nha-pho";
}

function parseFeatureList(text) {
  if (!text) return [];
  const found = [];
  for (const { keyword, feature } of FEATURE_KEYWORDS) {
    if (keyword.test(text)) found.push(feature);
  }
  return unique(found);
}

function parseDirection(text) {
  if (!text) return null;
  const dirs = ["Đông Nam", "Tây Bắc", "Đông Bắc", "Tây Nam", "Đông", "Tây", "Nam", "Bắc"];
  for (const dir of dirs) {
    if (text.includes(`hướng ${dir}`) || text.includes(`Hướng ${dir}`)) return dir;
  }
  return null;
}

function parseBedrooms(text) {
  const match = normalizeWhitespace(text).match(/(\d+)\s*(?:phòng ngủ|pn)/i);
  return match ? Number(match[1]) : 0;
}

function parseBathrooms(text) {
  const match = normalizeWhitespace(text).match(/(\d+)\s*(?:phòng tắm|wc|toilet|nhà vệ sinh)/i);
  return match ? Number(match[1]) : 0;
}

function parseFloor(text) {
  const match = normalizeWhitespace(text).match(/(\d+)\s*tầng/i);
  return match ? Number(match[1]) : null;
}

function extractFirstPriceToken(text) {
  const match = normalizeWhitespace(text).match(/(\d+[\d.,]*)\s*(tỷ|triệu|tr|usd|nghìn|ngan)(?:\/(?:tháng|thang|m2|m²))?/i);
  if (!match) return null;
  return {
    amountText: match[1],
    unit: match[2].toLowerCase(),
    raw: normalizeWhitespace(match[0]),
  };
}

function parseAreaNumber(text) {
  const match = normalizeWhitespace(text).match(/(\d+[\d.,]*)\s*(m²|m2)/i);
  if (!match) return 0;
  return Number(match[1].replace(/\./g, "").replace(/,/g, ".")) || 0;
}

function parsePrice(text, category) {
  const token = extractFirstPriceToken(text);
  if (!token) {
    return {
      price: null,
      priceFormatted: null,
      priceUnit: category === "rent" ? "triệu/tháng" : null,
      priceRaw: null,
    };
  }

  const amount = Number(token.amountText.replace(/\./g, "").replace(/,/g, "."));
  if (!Number.isFinite(amount)) {
    return {
      price: null,
      priceFormatted: null,
      priceUnit: null,
      priceRaw: token.raw,
    };
  }

  if (token.unit === "usd") {
    return {
      price: null,
      priceFormatted: token.amountText,
      priceUnit: "usd",
      priceRaw: token.raw,
    };
  }

  if (token.unit === "tỷ") {
    return {
      price: Math.round(amount * 1_000_000_000),
      priceFormatted: token.amountText,
      priceUnit: "tỷ",
      priceRaw: token.raw,
    };
  }

  return {
    price: Math.round(amount * 1_000_000),
    priceFormatted: token.amountText,
    priceUnit: category === "rent" ? "triệu/tháng" : "triệu",
    priceRaw: token.raw,
  };
}

function deriveLocation(address) {
  const clean = normalizeWhitespace(address);
  if (!clean) {
    return { address: null, district: null, city: null };
  }

  const parts = clean
    .split(",")
    .map((part) => normalizeWhitespace(part))
    .filter(Boolean);

  return {
    address: clean,
    district: parts.length >= 2 ? parts[parts.length - 2] : null,
    city: parts.length >= 1 ? parts[parts.length - 1] : null,
  };
}

function dedupKey(item) {
  const title = slugify(item.title || "");
  const district = slugify(item.district || item.city || "");
  const price = item.price || item.priceRaw || "na";
  const area = item.area || 0;
  return `${title}::${district}::${price}::${area}`;
}

function dedupKeys(item) {
  const title = slugify(item.title || "");
  const address = slugify(item.address || "");
  const district = slugify(item.district || item.city || "");
  const city = slugify(item.city || "");
  const price = item.price || item.priceRaw || "na";
  const area = item.area || 0;

  return unique([
    `${title}::${district}::${price}::${area}`,
    `${title}::${city}::${price}::${area}`,
    address ? `${address}::${price}::${area}` : null,
    address && title ? `${title}::${address}` : null,
  ]);
}

function targetPerSource(args) {
  return args.crawlAllRecent ? Number.POSITIVE_INFINITY : args.perSource;
}

function pageCeiling(args) {
  return args.crawlAllRecent ? args.maxPages : args.pages;
}

function sourceEnabled(args, sourceKey) {
  return !args.sources || args.sources.includes(sourceKey);
}

async function fetchText(url) {
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        signal: AbortSignal.timeout(30000),
        headers: {
          "user-agent": USER_AGENT,
          accept: "text/html,application/json;q=0.9,*/*;q=0.8",
          "accept-language": "vi,en-US;q=0.9,en;q=0.8",
          "accept-encoding": "identity",
          "cache-control": "no-cache",
        },
      });

      let text = "";
      try { text = await response.text(); } catch { /* gzip/decode error — skip */ }

      return {
        status: response.status,
        ok: response.ok,
        contentType: response.headers.get("content-type") || "",
        finalUrl: response.url,
        text,
      };
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await sleep(500 * (attempt + 1));
        continue;
      }
    }
  }

  console.error(`  fetchText failed after 3 attempts: ${url.slice(0, 80)} — ${lastError?.message || 'unknown'}`);
  return { status: 0, ok: false, contentType: "", finalUrl: url, text: "" };
}

// Extract real property description from page, filtering out SEO boilerplate
function extractDescription($, metaDescription, bodyText, preview) {
  // Try common description selectors first
  const selectors = [
    '.property-description', '.description', '.detail-description',
    '.content-detail', '.post-content', '[class*="description"]',
    '[class*="mota"]', '[class*="mo-ta"]', '[class*="noi-dung"]',
    '.text-content', '.detail-content',
  ];
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el.length) {
      const text = normalizeWhitespace(el.text());
      if (text.length > 30) return text.slice(0, 2000);
    }
  }

  // Fallback: use bodyText but filter out boilerplate patterns
  const boilerplate = /meeyland có \d+ ảnh|alonhadat|chotot\.com|mogi\.vn|đăng tin rao|môi giới đăng tin|mã tin rao|nguồn:|dang ngay:|url goc:/i;

  // Try metaDescription if it's not boilerplate
  if (metaDescription && metaDescription.length > 30 && !boilerplate.test(metaDescription)) {
    return metaDescription.slice(0, 2000);
  }

  // Try preview text
  if (preview?.text && preview.text.length > 30 && !boilerplate.test(preview.text)) {
    return preview.text.slice(0, 2000);
  }

  // Last resort: cleaned bodyText
  if (bodyText && bodyText.length > 50) {
    return bodyText.replace(boilerplate, '').slice(0, 2000);
  }

  return '';
}

function isCloudflareBlock(text) {
  const lowered = String(text || "").toLowerCase();
  return lowered.includes("just a moment") || lowered.includes("cf-browser-verification");
}

function getHighResUrl(url) {
  if (!url) return url;
  if (url.includes("img.meeyland.com")) return url.split("?")[0];
  if (url.includes("img.homedy.com")) return url.replace(/_\d+x\d+\.(jpg|jpeg|png)$/i, ".$1");
  if (url.includes("cloud.mogi.vn")) return url.replace(/\/thumb-(?:small|ms|large)\//i, "/");
  if (url.includes("cafeland.vn")) {
    const proxyMatch = url.match(/^.*\/image-data\/\d+-\d+\/(.*)$/i);
    if (proxyMatch) return "https://" + proxyMatch[1];
  }
  if (url.includes("odt.vn")) return url.replace(/\/(thumb|thumbs)\//i, "/");
  return url;
}

function filterImageUrls(urls, hosts) {
  return unique(
    urls.filter((url) => {
      if (!url) return false;
      if (url.startsWith("data:")) return false;
      return hosts.some((host) => url.includes(host));
    }).map(getHighResUrl)
  );
}

// Broader image filter - accepts any reasonable property image URL
// Used for sources whose CDN may change
function filterPropertyImages(urls) {
  const junkPatterns = /logo|icon|avatar|favicon|placeholder|spinner|loading|arrow|btn|button|banner|ads?[\-_\/]|pixel|tracking|1x1|spacer|emoji|badge/i;
  return unique(
    urls.filter((url) => {
      if (!url || url.startsWith("data:")) return false;
      if (!url.startsWith("http")) return false;
      if (junkPatterns.test(url)) return false;
      // Must look like an image URL
      if (!/\.(jpe?g|png|webp|avif)/i.test(url) && !url.includes("/image") && !url.includes("/photo") && !url.includes("/Product") && !url.includes("/store")) return false;
      return true;
    }).map(getHighResUrl)
  );
}

function buildListingRecord(raw) {
  const location = deriveLocation(raw.address || raw.locationText || "");
  const publishedAt = raw.publishedAt ? new Date(raw.publishedAt) : null;
  const sourcePostedText = normalizeWhitespace(raw.sourcePostedText || "") || null;
  const ageDays = publishedAt ? ageInDays(publishedAt) : null;
  return {
    source: raw.source,
    external_id: raw.externalId,
    external_url: raw.externalUrl,
    title: raw.title,
    slug: `${slugify(raw.title)}-${raw.source}-${raw.externalId}`.slice(0, 240),
    price: raw.price ?? null,
    price_formatted: raw.priceFormatted ?? null,
    price_unit: raw.priceUnit ?? null,
    price_raw: raw.priceRaw ?? null,
    type: raw.type,
    category: raw.category,
    status: "published",
    address: location.address,
    district: raw.district || location.district,
    city: raw.city || location.city,
    bedrooms: raw.bedrooms || 0,
    bathrooms: raw.bathrooms || 0,
    area: raw.area || 0,
    floor: raw.floor || null,
    direction: raw.direction || null,
    description: raw.description || "",
    images: unique(raw.images || []),
    downloaded_images: [],
    features: unique(raw.features || []),
    contact_name: raw.contactName || null,
    contact_phone: raw.contactPhone || null,
    latitude: raw.latitude || null,
    longitude: raw.longitude || null,
    published_at: publishedAt ? publishedAt.toISOString() : null,
    age_days: ageDays,
    posted_date: publishedAt ? formatDisplayDate(publishedAt) : null,
    posted_label: publishedAt ? formatRecencyLabel(publishedAt) : null,
    source_posted_text: sourcePostedText,
    is_latest: ageDays !== null ? ageDays <= 1 : false,
    freshness_bucket: freshnessBucket(ageDays),
    freshness_rank: freshnessRank(ageDays),
  };
}

async function crawlChotot(args) {
  if (!sourceEnabled(args, "chotot_api")) {
    return { listings: [], requestCount: 0 };
  }

  const listings = [];
  const seen = new Set();
  let requestCount = 0;
  const perSourceLimit = targetPerSource(args);

  for (const cat of CHOTOT_CATEGORIES) {
    for (const saleType of CHOTOT_SALE_TYPES) {
      if (cat.type === "dat-nen" && saleType.category === "rent") continue;
      if (cat.type === "phong-tro" && saleType.category === "sale") continue;

      for (const region of CHOTOT_REGIONS) {
        if (listings.length >= perSourceLimit) break;
        const pageLimit = pageCeiling(args);
        let stalePages = 0;

        for (let page = 0; page < pageLimit; page += 1) {
          if (listings.length >= perSourceLimit) break;
          const offset = page * 50;
          const url = `https://gateway.chotot.com/v1/public/ad-listing?cg=${cat.cg}&limit=50&o=${offset}&st=${saleType.st}&region_v2=${region.code}&sort_by=date&date=-1`;
          const response = await fetchText(url);
          requestCount += 1;
          if (!response.ok) break;

          const payload = JSON.parse(response.text);
          const ads = Array.isArray(payload.ads) ? payload.ads : [];
          if (ads.length === 0) break;
          let recentOnPage = 0;

          for (const ad of ads) {
            if (listings.length >= perSourceLimit) break;
            const priceMeta = parsePrice(ad.price_string || String(ad.price || ""), saleType.category);
            const address = [ad.street_name, ad.ward_name_v3 || ad.ward_name, ad.area_name, ad.region_name_v3 || ad.region_name]
              .filter(Boolean)
              .join(", ");
            const title = normalizeWhitespace(ad.subject || `${cat.label} ${region.name}`);
            const images = unique(
              [
                ...(Array.isArray(ad.image_thumbnails) ? ad.image_thumbnails.map((t) => t?.image || t?.thumbnail_image) : []),
                ...(Array.isArray(ad.images) ? ad.images.map((image) => (typeof image === "string" ? image : image?.image || image?.thumbnail_image)) : []),
                ad.image,
                ad.thumbnail_image,
              ].filter(Boolean),
            ).slice(0, args.imageLimit);
            if (!title || images.length === 0) continue;

            const raw = {
              source: "chotot_api",
              externalId: String(ad.list_id || ad.ad_id || crypto.randomUUID()),
              externalUrl: ad.list_id
                ? `https://www.chotot.com/mua-ban-bat-dong-san/${ad.list_id}.htm`
                : url,
              title,
              price: priceMeta.price,
              priceFormatted: priceMeta.priceFormatted,
              priceUnit: saleType.category === "rent" ? "triệu/tháng" : priceMeta.priceUnit,
              priceRaw: ad.price_string || priceMeta.priceRaw,
              type: cat.type === "nha-pho" && Number(ad.size || 0) >= 200 && Number(ad.price || 0) >= 10_000_000_000
                ? "biet-thu"
                : cat.type,
              category: saleType.category,
              address,
              district: ad.area_name || null,
              city: ad.region_name_v3 || ad.region_name || region.name,
              bedrooms: Number(ad.rooms || ad.number_of_room || 0),
              bathrooms: Number(ad.toilets || ad.number_of_toilet || 0),
              area: Number(ad.size || ad.area || 0),
              floor: Number(ad.floors || ad.number_of_floor || 0) || null,
              direction: parseDirection(ad.body || ""),
              description: normalizeWhitespace(ad.body || ""),
              images,
              features: parseFeatureList(ad.body || ""),
              contactName: normalizeWhitespace(ad.account_name || ad.full_name || ""),
              contactPhone: ad.phone || null,
              latitude: ad.latitude || null,
              longitude: ad.longitude || null,
              publishedAt: ad.list_time ? new Date(ad.list_time) : null,
              sourcePostedText: ad.list_time ? new Date(ad.list_time).toISOString() : null,
            };

            const record = buildListingRecord(raw);
            if (!isRecentEnough(record.published_at ? new Date(record.published_at) : null, args.maxAgeDays)) {
              continue;
            }
            recentOnPage += 1;
            const keys = dedupKeys(record);
            if (keys.some((key) => seen.has(key))) continue;
            keys.forEach((key) => seen.add(key));
            listings.push(record);
          }

          if (args.crawlAllRecent) {
            stalePages = recentOnPage === 0 ? stalePages + 1 : 0;
            if (stalePages >= args.stalePageThreshold) break;
          }

          await sleep(args.delayMs);
        }
      }
    }
  }

  return { listings, requestCount };
}

function alonhadatPageUrl(baseUrl, page) {
  return page === 1 ? baseUrl : `${baseUrl}/trang-${page}`;
}

function homedyPageUrl(baseUrl, page) {
  return page === 1 ? baseUrl : `${baseUrl}/p${page}`;
}

function meeylandPageUrl(baseUrl, page) {
  return `${baseUrl}?page=${page}`;
}

function pagedUrlWithSuffix(baseUrl, page, suffix) {
  return page === 1 ? baseUrl : `${baseUrl}${suffix}${page}`;
}

function queryPagedUrl(baseUrl, page) {
  return page === 1 ? baseUrl : `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}page=${page}`;
}

async function parseAlonhadatPage(pageUrl, category, args, seenUrls) {
  const response = await fetchText(pageUrl);
  if (!response.ok || isCloudflareBlock(response.text)) return [];

  const $ = cheerio.load(response.text);
  return $("article.property-item")
    .toArray()
    .map((element) => {
      const article = $(element);
      const href = absoluteUrl(pageUrl, article.find("a[itemprop='url']").attr("href") || "");
      const title = normalizeWhitespace(article.find("h3[itemprop='name']").text());
      if (!href || !title || seenUrls.has(href)) return null;
      seenUrls.add(href);

      const descriptionRaw = normalizeWhitespace(article.find("p.brief").text());
      const description = descriptionRaw.replace(/\.{3,}\s*<<\s*Xem chi tiết\s*>>/gi, "").trim();
      const detailText = normalizeWhitespace(article.find(".property-details").text());
      const sourcePostedText = article.find("time.created-date").attr("datetime") || article.find("time.created-date").text();
      const publishedAt = parsePublishedAt(sourcePostedText);
      const address = normalizeWhitespace(
        article.find(".new-address").text() || article.find(".old-address").text() || article.find(".property-address").text(),
      );
      const image = absoluteUrl(pageUrl, article.find(".thumbnail img").attr("src") || article.find(".thumbnail img").attr("data-src") || "");
      const priceMeta = parsePrice(detailText, category);
      const type = inferType(`${title} ${description}`);

      return buildListingRecord({
        source: "alonhadat",
        externalId: href.match(/-(\d+)\.html$/)?.[1] || slugify(title),
        externalUrl: href,
        title,
        price: priceMeta.price,
        priceFormatted: priceMeta.priceFormatted,
        priceUnit: priceMeta.priceUnit,
        priceRaw: priceMeta.priceRaw,
        type,
        category,
        address,
        area: parseAreaNumber(detailText),
        bedrooms: parseBedrooms(detailText),
        bathrooms: parseBathrooms(detailText),
        floor: parseFloor(detailText),
        direction: parseDirection(description),
        description,
        images: image ? [image] : [],
        features: parseFeatureList(description),
        publishedAt,
        sourcePostedText,
      });
    })
    .filter((item) => item && item.images.length > 0 && isRecentEnough(item.published_at ? new Date(item.published_at) : null, args.maxAgeDays))
    .slice(0, args.perSource);
}

async function fetchHtmlDetail(detailUrl) {
  const response = await fetchText(detailUrl);
  if (!response.ok || isCloudflareBlock(response.text)) return null;
  return response.text;
}

function parseHomedyDetail(detailUrl, html, category, preview) {
  const $ = cheerio.load(html);
  const pageTitle = normalizeWhitespace($("title").first().text()).replace(/\s*\|.*$/, "");
  const metaDescription = normalizeWhitespace($("meta[name='description']").attr("content") || "");
  const bodyText = normalizeWhitespace($("body").text()).slice(0, 4000);
  const text = `${preview.text || ""} ${metaDescription} ${bodyText}`;
  const sourcePostedText = normalizeWhitespace(preview.postedText || preview.listingText || text);
  const publishedAt = parsePublishedAt(sourcePostedText);
  const priceMeta = parsePrice(text, category);
  const allImgUrls = $("img")
    .map((_, element) => absoluteUrl(detailUrl, $(element).attr("data-src") || $(element).attr("src") || ""))
    .get();
  // Try strict filter first, fallback to broad filter
  let images = filterImageUrls(allImgUrls, ["img.homedy.com/store/images/", "img.homedy.com"]).slice(0, 12);
  if (!images.length) images = filterPropertyImages(allImgUrls).slice(0, 12);
  const addressMatch = metaDescription.match(/bán tại\s+(.+?)(?:\.|\-|\|)/i) || metaDescription.match(/cho thuê tại\s+(.+?)(?:\.|\-|\|)/i);
  const address = addressMatch ? normalizeWhitespace(addressMatch[1]) : preview.address || null;

  return buildListingRecord({
    source: "homedy",
    externalId: detailUrl.match(/-es(\d+)$/i)?.[1] || slugify(pageTitle),
    externalUrl: detailUrl,
    title: pageTitle || preview.title,
    price: priceMeta.price,
    priceFormatted: priceMeta.priceFormatted,
    priceUnit: priceMeta.priceUnit,
    priceRaw: priceMeta.priceRaw,
    type: inferType(`${pageTitle} ${metaDescription}`),
    category,
    address,
    area: parseAreaNumber(text),
    bedrooms: parseBedrooms(text),
    bathrooms: parseBathrooms(text),
    floor: parseFloor(text),
    direction: parseDirection(text),
    description: extractDescription($, metaDescription, bodyText, preview),
    images,
    features: parseFeatureList(text),
    publishedAt,
    sourcePostedText,
  });
}

function parseMeeylandDetail(detailUrl, html, category, preview) {
  const $ = cheerio.load(html);
  const pageTitle = normalizeWhitespace($("title").first().text()).replace(/\s*\|.*$/, "");
  const metaDescription = normalizeWhitespace($("meta[name='description']").attr("content") || "");
  const bodyText = normalizeWhitespace($("body").text()).slice(0, 4000);
  const text = `${preview.text || ""} ${metaDescription} ${bodyText}`;
  const sourcePostedText = normalizeWhitespace(preview.postedText || text);
  const explicitPublishedAt = parsePublishedAt(sourcePostedText);
  const embeddedDates = [
    ...html.matchAll(/(?:publishedAt|updatedAt|createdAt)&quot;:\[0,&quot;(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+Z)&quot;/g),
  ].map((match) => new Date(match[1]));
  const publishedAt = explicitPublishedAt || pickRecentDate(embeddedDates, DEFAULT_MAX_AGE_DAYS);
  const priceMeta = parsePrice(text, category);
  const images = filterImageUrls(
    $("img")
      .map((_, element) => absoluteUrl(detailUrl, $(element).attr("data-src") || $(element).attr("src") || ""))
      .get(),
    ["img.meeyland.com/"],
  ).slice(0, 12);
  const locationInTitle = pageTitle.includes(",") ? pageTitle.split(/\|/)[0].replace(/^(Bán|Cho thuê)\s+/i, "") : preview.address || null;

  return buildListingRecord({
    source: "meeyland",
    externalId: detailUrl.match(/\/(\d+)$/)?.[1] || slugify(pageTitle),
    externalUrl: detailUrl,
    title: pageTitle || preview.title,
    price: priceMeta.price,
    priceFormatted: priceMeta.priceFormatted,
    priceUnit: priceMeta.priceUnit,
    priceRaw: priceMeta.priceRaw,
    type: inferType(`${pageTitle} ${metaDescription}`),
    category,
    address: locationInTitle,
    area: parseAreaNumber(text),
    bedrooms: parseBedrooms(text),
    bathrooms: parseBathrooms(text),
    floor: parseFloor(text),
    direction: parseDirection(text),
    description: extractDescription($, metaDescription, bodyText, preview),
    images,
    features: parseFeatureList(text),
    publishedAt,
    sourcePostedText: sourcePostedText || (publishedAt ? publishedAt.toISOString() : null),
  });
}

function sortListings(listings) {
  return [...listings].sort((left, right) => {
    const freshnessDiff = (right.freshness_rank || 0) - (left.freshness_rank || 0);
    if (freshnessDiff !== 0) return freshnessDiff;

    const leftPublished = left.published_at ? new Date(left.published_at).getTime() : 0;
    const rightPublished = right.published_at ? new Date(right.published_at).getTime() : 0;
    if (rightPublished !== leftPublished) return rightPublished - leftPublished;

    return (right.price || 0) - (left.price || 0);
  });
}

function buildLatestCsv(listings) {
  const header = [
    "source",
    "title",
    "category",
    "type",
    "city",
    "district",
    "price",
    "price_unit",
    "posted_date",
    "posted_label",
    "age_days",
    "is_latest",
    "freshness_bucket",
    "freshness_rank",
    "external_url",
  ];

  const rows = listings.map((listing) => [
    listing.source,
    listing.title,
    listing.category,
    listing.type,
    listing.city,
    listing.district,
    listing.price_formatted || listing.price || "",
    listing.price_unit,
    listing.posted_date,
    listing.posted_label,
    listing.age_days,
    listing.is_latest,
    listing.freshness_bucket,
    listing.freshness_rank,
    listing.external_url,
  ]);

  return [header, ...rows].map((row) => row.map(escapeCsv).join(",")).join("\n");
}

function buildSourceSummary(listings) {
  const summary = {};
  for (const listing of listings) {
    if (!summary[listing.source]) {
      summary[listing.source] = {
        total: 0,
        latest: 0,
        avg_freshness_rank: 0,
      };
    }

    summary[listing.source].total += 1;
    if (listing.is_latest) summary[listing.source].latest += 1;
    summary[listing.source].avg_freshness_rank += Number(listing.freshness_rank || 0);
  }

  for (const item of Object.values(summary)) {
    item.avg_freshness_rank = Number((item.avg_freshness_rank / item.total).toFixed(1));
  }

  return summary;
}

function parseMogiDetail(detailUrl, html, category, preview) {
  const $ = cheerio.load(html);
  const pageTitle = normalizeWhitespace($("title").first().text()).replace(/\s*-\s*Mogi\.vn$/i, "");
  const metaDescription = normalizeWhitespace($("meta[name='description']").attr("content") || "");
  const address = normalizeWhitespace($(".main-info .address").first().text());
  const bodyText = normalizeWhitespace($(".info-content-body, .property-detail").text()).slice(0, 4000);
  const text = `${preview.text || ""} ${metaDescription} ${bodyText}`;
  const sourcePostedText = normalizeWhitespace(preview.postedText || $(".prop-created, .info-content-body").text() || text);
  const publishedAt = parsePublishedAt(sourcePostedText);
  const priceMeta = parsePrice(normalizeWhitespace($(".main-info .price").first().text()) || text, category);
  const images = filterImageUrls(
    $("img")
      .map((_, element) => absoluteUrl(detailUrl, $(element).attr("data-src") || $(element).attr("src") || ""))
      .get(),
    ["cloud.mogi.vn/images/", "mogi.vn/media/", "mogi.vn/content/images/"],
  ).slice(0, 12);

  return buildListingRecord({
    source: "mogi",
    externalId: detailUrl.match(/id(\d+)/i)?.[1] || slugify(pageTitle),
    externalUrl: detailUrl,
    title: pageTitle || preview.title,
    price: priceMeta.price,
    priceFormatted: priceMeta.priceFormatted,
    priceUnit: priceMeta.priceUnit,
    priceRaw: priceMeta.priceRaw,
    type: inferType(`${pageTitle} ${metaDescription}`),
    category,
    address,
    area: parseAreaNumber(text),
    bedrooms: parseBedrooms(text),
    bathrooms: parseBathrooms(text),
    floor: parseFloor(text),
    direction: parseDirection(text),
    description: extractDescription($, metaDescription, bodyText, preview),
    images,
    features: parseFeatureList(text),
    publishedAt,
    sourcePostedText,
  });
}

function parseOdtDetail(detailUrl, html, category, preview) {
  const $ = cheerio.load(html);
  const pageTitle = normalizeWhitespace($("title").first().text()).replace(/^Bán\s+/i, "Bán ").replace(/^Cho thuê\s+/i, "Cho thuê ");
  const metaDescription = normalizeWhitespace($("meta[name='description']").attr("content") || "");
  const address = normalizeWhitespace($(".detail .address, .address").first().text());
  const bodyText = normalizeWhitespace($(".post-content, .detail").text()).slice(0, 4000);
  const text = `${preview.text || ""} ${metaDescription} ${bodyText}`;
  const sourcePostedText = normalizeWhitespace(preview.postedText || $(".time").first().text() || text);
  const publishedAt = parsePublishedAt(sourcePostedText);
  const priceMeta = parsePrice(normalizeWhitespace($(".detail .price, .price").first().text()) || text, category);
  const images = filterImageUrls(
    $("img")
      .map((_, element) => absoluteUrl(detailUrl, $(element).attr("data-src") || $(element).attr("src") || ""))
      .get(),
    ["odt.vn/storage/properties/", "s1.odt.vn/uploads/properties/"],
  ).slice(0, 12);

  return buildListingRecord({
    source: "odt",
    externalId: detailUrl.match(/-(\d+)\.html$/)?.[1] || slugify(pageTitle),
    externalUrl: detailUrl,
    title: pageTitle || preview.title,
    price: priceMeta.price,
    priceFormatted: priceMeta.priceFormatted,
    priceUnit: priceMeta.priceUnit,
    priceRaw: priceMeta.priceRaw,
    type: inferType(`${pageTitle} ${metaDescription}`),
    category,
    address,
    area: parseAreaNumber(text),
    bedrooms: parseBedrooms(text),
    bathrooms: parseBathrooms(text),
    floor: parseFloor(text),
    direction: parseDirection(text),
    description: extractDescription($, metaDescription, bodyText, preview),
    images,
    features: parseFeatureList(text),
    publishedAt,
    sourcePostedText,
  });
}

function parseMuonnhaDetail(detailUrl, html, category, preview) {
  const $ = cheerio.load(html);
  const pageTitle = normalizeWhitespace($("title").first().text()).replace(/^Bán\s+căn hộ chung cư\s+/i, "");
  const metaDescription = normalizeWhitespace($("meta[name='description']").attr("content") || "");
  const bodyText = normalizeWhitespace($("body").text()).slice(0, 4000);
  const text = `${preview.text || ""} ${metaDescription} ${bodyText}`;
  const sourcePostedText = normalizeWhitespace(preview.postedText || text);
  const publishedAt = parsePublishedAt(sourcePostedText);
  const priceMeta = parsePrice(text, category);
  const allImgUrls = $("img")
    .map((_, element) => absoluteUrl(detailUrl, $(element).attr("data-src") || $(element).attr("src") || ""))
    .get();
  let images = filterImageUrls(allImgUrls, ["static.muonnha.com.vn/Product/", "muonnha.com.vn"]).slice(0, 12);
  if (!images.length) images = filterPropertyImages(allImgUrls).slice(0, 12);
  // Try to extract address from meta description
  const addressMatch = metaDescription.match(/(?:tại|ở)\s+(.+?)(?:\.|\-|\||,\s*giá)/i);
  const address = addressMatch ? normalizeWhitespace(addressMatch[1]) : preview.address || null;

  return buildListingRecord({
    source: "muonnha",
    externalId: detailUrl.match(/-pr(\d+)\.html$/i)?.[1] || slugify(pageTitle),
    externalUrl: detailUrl,
    title: normalizeWhitespace(pageTitle) || preview.title,
    price: priceMeta.price,
    priceFormatted: priceMeta.priceFormatted,
    priceUnit: priceMeta.priceUnit,
    priceRaw: priceMeta.priceRaw,
    type: inferType(`${pageTitle} ${metaDescription}`),
    category,
    address,
    area: parseAreaNumber(text),
    bedrooms: parseBedrooms(text),
    bathrooms: parseBathrooms(text),
    floor: parseFloor(text),
    direction: parseDirection(text),
    description: extractDescription($, metaDescription, bodyText, preview),
    images,
    features: parseFeatureList(text),
    publishedAt,
    sourcePostedText,
  });
}

function parseCafelandDetail(detailUrl, html, category, preview) {
  const $ = cheerio.load(html);
  const pageTitle = normalizeWhitespace($("title").first().text());
  const metaDescription = normalizeWhitespace($("meta[name='description']").attr("content") || "");
  const bodyText = normalizeWhitespace($("body").text()).slice(0, 5000);
  const text = `${preview.text || ""} ${metaDescription} ${bodyText}`;
  const sourcePostedText = normalizeWhitespace(preview.postedText || bodyText);
  const publishedAt = parsePublishedAt(sourcePostedText);
  const priceMeta = parsePrice(text, category);
  const allImgUrls = $("img")
    .map((_, element) => absoluteUrl(detailUrl, $(element).attr("data-src") || $(element).attr("src") || ""))
    .get();
  let images = filterImageUrls(allImgUrls, ["nhadat.cafeland.vn", "static2.cafeland.vn", "cafeland.vn"])
    .filter((url) => !url.includes("logo") && !url.includes("img_empty") && !url.includes("icon-post")).slice(0, 12);
  if (!images.length) images = filterPropertyImages(allImgUrls).slice(0, 12);
  // Try to extract address from meta description or body
  const addressMatch = metaDescription.match(/(?:tại|ở|địa chỉ:?)\s+(.+?)(?:\.|\-|\||,\s*giá|,\s*diện)/i);
  const address = addressMatch ? normalizeWhitespace(addressMatch[1]) : preview.address || null;

  return buildListingRecord({
    source: "cafeland",
    externalId: detailUrl.match(/-(\d+)\.html$/)?.[1] || slugify(pageTitle),
    externalUrl: detailUrl,
    title: pageTitle || preview.title,
    price: priceMeta.price,
    priceFormatted: priceMeta.priceFormatted,
    priceUnit: priceMeta.priceUnit,
    priceRaw: priceMeta.priceRaw,
    type: inferType(`${pageTitle} ${metaDescription}`),
    category,
    address,
    area: parseAreaNumber(text),
    bedrooms: parseBedrooms(text),
    bathrooms: parseBathrooms(text),
    floor: parseFloor(text),
    direction: parseDirection(text),
    description: extractDescription($, metaDescription, bodyText, preview),
    images,
    features: parseFeatureList(text),
    publishedAt,
    sourcePostedText,
  });
}

function parseExternalDetail(source, detailUrl, html, preview) {
  if (source.key === "mogi") return parseMogiDetail(detailUrl, html, source.category, preview);
  if (source.key === "odt") return parseOdtDetail(detailUrl, html, source.category, preview);
  if (source.key === "muonnha") return parseMuonnhaDetail(detailUrl, html, source.category, preview);
  if (source.key === "cafeland") return parseCafelandDetail(detailUrl, html, source.category, preview);
  return null;
}

function collectCandidates(pageUrl, html, source, args) {
  const $ = cheerio.load(html);
  const patterns = {
    homedy: /\/(ban|cho-thue)-.*-es\d+$/i,
    meeyland: /\/(ban|cho-thue)-[^/]+\/\d+$/i,
    mogi: /^https?:\/\/mogi\.vn\/.*id\d+$/i,
    odt: /^https?:\/\/odt\.vn\/.*-\d+\.html$/i,
    muonnha: /-pr\d+\.html$/i,
    cafeland: /^https?:\/\/nhadat\.cafeland\.vn\/.*-\d+\.html$/i,
  };
  const candidates = [];
  const seenUrls = new Set();

  $("a[href]").each((_, element) => {
    if (candidates.length >= args.perSource * 3) return false;
    const href = absoluteUrl(pageUrl, $(element).attr("href") || "");
    const text = normalizeWhitespace($(element).text());
    const listingText = normalizeWhitespace($(element).parent().parent().text()) || text;
    const pattern = patterns[source.key];
    if (!href || !pattern?.test(href) || seenUrls.has(href)) return;
    if (text.length < 16 && listingText.length < 40) return;
    seenUrls.add(href);
    const postedMatch = listingText.match(/(Hôm nay|Hôm qua|\d+\s*(?:phút|giờ|ngày|tuần|tháng)\s*trước|\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}|\d{4}-\d{2}-\d{2})/i);
    candidates.push({
      href,
      text,
      title: text,
      address: null,
      listingText,
      postedText: postedMatch ? postedMatch[0] : null,
    });
  });

  return candidates;
}

async function crawlHomedyOrMeeyland(source, args) {
  const listings = [];
  const seenUrls = new Set();
  let requestCount = 0;
  const perSourceLimit = targetPerSource(args);
  let stalePages = 0;

  for (let page = 1; page <= pageCeiling(args); page += 1) {
    const pageUrl =
      source.key === "homedy"
        ? homedyPageUrl(source.baseUrl, page)
        : meeylandPageUrl(source.baseUrl, page);
    const response = await fetchText(pageUrl);
    requestCount += 1;
    if (!response.ok || isCloudflareBlock(response.text)) break;

    const candidates = collectCandidates(pageUrl, response.text, source, args).filter((candidate) => {
      if (seenUrls.has(candidate.href)) return false;
      seenUrls.add(candidate.href);
      return true;
    });
    let recentOnPage = 0;

    let skipStats = { noHtml: 0, tooOld: 0, noImages: 0 };
    for (const candidate of candidates) {
      if (listings.length >= perSourceLimit) break;
      const detailHtml = await fetchHtmlDetail(candidate.href);
      requestCount += 1;
      if (!detailHtml) { skipStats.noHtml++; continue; }

      const record = source.key === "homedy"
        ? parseHomedyDetail(candidate.href, detailHtml, source.category, candidate)
        : parseMeeylandDetail(candidate.href, detailHtml, source.category, candidate);
      if (!isRecentEnough(record.published_at ? new Date(record.published_at) : null, args.maxAgeDays)) { skipStats.tooOld++; continue; }
      recentOnPage += 1;
      if (!record.images.length) { skipStats.noImages++; continue; }
      listings.push(record);
      await sleep(args.delayMs);
    }
    if (candidates.length > 0) {
      console.log(`  [${source.key}] page ${page}: ${candidates.length} candidates, ${listings.length} kept | skipped: html=${skipStats.noHtml} old=${skipStats.tooOld} noImg=${skipStats.noImages}`);
    }

    if (args.crawlAllRecent) {
      stalePages = recentOnPage === 0 ? stalePages + 1 : 0;
      if (stalePages >= args.stalePageThreshold) break;
    }

    await sleep(args.delayMs);
  }

  return { listings, requestCount };
}

async function crawlConfiguredExternalSource(source, args) {
  const listings = [];
  const seenUrls = new Set();
  let requestCount = 0;
  const perSourceLimit = targetPerSource(args);
  let stalePages = 0;

  for (let page = 1; page <= pageCeiling(args); page += 1) {
    let pageUrl = source.baseUrl;
    if (source.key === "mogi") pageUrl = queryPagedUrl(source.baseUrl, page);
    if (source.key === "odt") pageUrl = pagedUrlWithSuffix(source.baseUrl, page, "/trang-");
    if (source.key === "muonnha") pageUrl = queryPagedUrl(source.baseUrl, page);
    if (source.key === "cafeland") pageUrl = pagedUrlWithSuffix(source.baseUrl.replace(/\/$/, ""), page, "/trang-") + (source.baseUrl.endsWith("/") && page > 1 ? "/" : "");

    const response = await fetchText(pageUrl);
    requestCount += 1;
    if (!response.ok || isCloudflareBlock(response.text)) break;

    const candidates = collectCandidates(pageUrl, response.text, source, args).filter((candidate) => {
      if (seenUrls.has(candidate.href)) return false;
      seenUrls.add(candidate.href);
      return true;
    });
    let recentOnPage = 0;

    let skipStats = { noHtml: 0, noParse: 0, tooOld: 0, noImages: 0 };
    for (const candidate of candidates) {
      if (listings.length >= perSourceLimit) break;
      const detailHtml = await fetchHtmlDetail(candidate.href);
      requestCount += 1;
      if (!detailHtml) { skipStats.noHtml++; continue; }
      const record = parseExternalDetail(source, candidate.href, detailHtml, candidate);
      if (!record) { skipStats.noParse++; continue; }
      if (!isRecentEnough(record.published_at ? new Date(record.published_at) : null, args.maxAgeDays)) { skipStats.tooOld++; continue; }
      recentOnPage += 1;
      if (!record.images.length) { skipStats.noImages++; continue; }
      listings.push(record);
      await sleep(args.delayMs);
    }
    if (candidates.length > 0) {
      console.log(`  [${source.key}] page ${page}: ${candidates.length} candidates, ${listings.length} kept | skipped: html=${skipStats.noHtml} parse=${skipStats.noParse} old=${skipStats.tooOld} noImg=${skipStats.noImages}`);
    }

    if (args.crawlAllRecent) {
      stalePages = recentOnPage === 0 ? stalePages + 1 : 0;
      if (stalePages >= args.stalePageThreshold) break;
    }

    await sleep(args.delayMs);
  }

  return { listings, requestCount };
}

async function crawlAlonhadat(args) {
  const listings = [];
  const seen = new Set();
  let requestCount = 0;
  const perSourceLimit = targetPerSource(args);

  for (const source of HTML_SOURCES.filter((item) => item.key === "alonhadat")) {
    const seenUrls = new Set();
    let stalePages = 0;
    for (let page = 1; page <= pageCeiling(args); page += 1) {
      if (listings.length >= perSourceLimit) break;
      const pageUrl = alonhadatPageUrl(source.baseUrl, page);
      const pageListings = await parseAlonhadatPage(pageUrl, source.category, args, seenUrls);
      requestCount += 1;

      if (args.crawlAllRecent) {
        stalePages = pageListings.length === 0 ? stalePages + 1 : 0;
        if (stalePages >= args.stalePageThreshold) break;
      }

      for (const item of pageListings) {
        const keys = dedupKeys(item);
        if (keys.some((key) => seen.has(key))) continue;
        keys.forEach((key) => seen.add(key));
        listings.push(item);
        if (listings.length >= perSourceLimit) break;
      }

      await sleep(args.delayMs);
    }
  }

  return { listings, requestCount };
}

async function crawlHtmlSources(args) {
  const all = [];
  let requestCount = 0;

  if (sourceEnabled(args, "alonhadat")) {
    const alonhadat = await crawlAlonhadat(args);
    all.push(...alonhadat.listings);
    requestCount += alonhadat.requestCount;
  }

  for (const source of HTML_SOURCES.filter((item) => (item.key === "homedy" || item.key === "meeyland") && sourceEnabled(args, item.key))) {
    const result = await crawlHomedyOrMeeyland(source, args);
    all.push(...result.listings);
    requestCount += result.requestCount;
  }

  for (const source of HTML_SOURCES.filter((item) => ["mogi", "odt", "muonnha", "cafeland"].includes(item.key) && sourceEnabled(args, item.key))) {
    const result = await crawlConfiguredExternalSource(source, args);
    all.push(...result.listings);
    requestCount += result.requestCount;
  }

  return { listings: all, requestCount };
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function extensionFromUrl(url, contentType) {
  const pathname = new URL(url).pathname;
  const ext = path.extname(pathname).toLowerCase();
  if (ext && ext.length <= 5) return ext;
  if (contentType?.includes("png")) return ".png";
  if (contentType?.includes("webp")) return ".webp";
  return ".jpg";
}

function safeSegment(value) {
  return slugify(value || "item") || "item";
}

async function downloadImage(url, destDir, prefix) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      referer: new URL(url).origin,
    },
  });
  if (!response.ok) throw new Error(`Image download failed: ${response.status}`);
  const arrayBuffer = await response.arrayBuffer();
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 10);
  const ext = extensionFromUrl(url, response.headers.get("content-type") || "");
  const fileName = `${prefix}-${hash}${ext}`;
  const filePath = path.join(destDir, fileName);
  await fs.writeFile(filePath, Buffer.from(arrayBuffer));
  return filePath;
}

async function downloadImages(listings, args, outDir) {
  if (!args.downloadImages) return { downloaded: 0 };
  let downloaded = 0;
  const imagesDir = path.join(outDir, "images");
  await ensureDir(imagesDir);

  for (const listing of listings) {
    const listingDir = path.join(imagesDir, listing.source, safeSegment(listing.external_id));
    await ensureDir(listingDir);
    const selected = listing.images.slice(0, args.imageLimit);
    const localPaths = [];

    for (let index = 0; index < selected.length; index += 1) {
      const imageUrl = selected[index];
      try {
        const filePath = await downloadImage(imageUrl, listingDir, String(index + 1).padStart(2, "0"));
        localPaths.push(path.relative(outDir, filePath));
        downloaded += 1;
      } catch {
        // Skip broken image downloads and keep remote URL in manifest.
      }
      await sleep(120);
    }

    listing.downloaded_images = localPaths;
  }

  return { downloaded };
}

function summarize(listings) {
  const bySource = {};
  for (const listing of listings) {
    bySource[listing.source] = (bySource[listing.source] || 0) + 1;
  }
  return bySource;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.resolve(args.outDir || path.join("output", `multi-source-${stamp}`));
  await ensureDir(outDir);

  console.log("=== Multi-source crawler ===");
  console.log(`pages=${args.pages} maxPages=${args.maxPages} perSource=${args.perSource} crawlAllRecent=${args.crawlAllRecent} downloadImages=${args.downloadImages}`);
  console.log(`outDir=${outDir}\n`);

  const startedAt = new Date().toISOString();
  const chotot = await crawlChotot(args);
  const html = await crawlHtmlSources(args);

  const deduped = [];
  const seen = new Set();
  for (const item of [...chotot.listings, ...html.listings]) {
    const keys = dedupKeys(item);
    if (keys.some((key) => seen.has(key))) continue;
    keys.forEach((key) => seen.add(key));
    deduped.push(item);
  }

  const sortedListings = sortListings(deduped);
  const imageStats = await downloadImages(sortedListings, args, outDir);
  const manifest = {
    generated_at: startedAt,
    args,
    stats: {
      total_listings: sortedListings.length,
      by_source: summarize(sortedListings),
      requests: chotot.requestCount + html.requestCount,
      downloaded_images: imageStats.downloaded,
    },
    source_summary: buildSourceSummary(sortedListings),
    listings: sortedListings,
  };

  await fs.writeFile(path.join(outDir, "multi-source-listings.json"), JSON.stringify(sortedListings, null, 2));
  await fs.writeFile(path.join(outDir, "multi-source-manifest.json"), JSON.stringify(manifest, null, 2));
  await fs.writeFile(path.join(outDir, "latest-listings.csv"), buildLatestCsv(sortedListings));

  console.log("Saved files:");
  console.log(`- ${path.join(outDir, "multi-source-listings.json")}`);
  console.log(`- ${path.join(outDir, "multi-source-manifest.json")}`);
  console.log(`- ${path.join(outDir, "latest-listings.csv")}`);
  if (args.downloadImages) {
    console.log(`- ${path.join(outDir, "images")}`);
  }

  console.log("\nStats:");
  console.log(JSON.stringify(manifest.stats, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
