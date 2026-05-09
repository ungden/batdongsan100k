#!/usr/bin/env node
/**
 * Catalyst crawler.
 *
 * Pulls Vietnamese real estate news from Google News RSS for each project,
 * classifies title via keyword heuristics, upserts into project_catalysts.
 *
 * Usage:
 *   node catalyst-crawl.mjs                          # all projects
 *   node catalyst-crawl.mjs --slug=vinhomes-grand-park
 *   node catalyst-crawl.mjs --limit=20 --dry-run
 *
 * Env:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  (required)
 */

import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USER_AGENT = "Mozilla/5.0 (compatible; TitanHomeCatalystBot/1.0)";

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env");
  process.exit(1);
}

// Parse args
const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? true] : [a, true];
}));
const DRY_RUN = !!args["dry-run"];
const SLUG_FILTER = args["slug"];
const LIMIT = Number(args["limit"]) || 100;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

// ============================================================
// Classification rules — keyword → (category, impact, horizon)
// ============================================================
const RULES = [
  // Infrastructure — high impact
  { kw: /metro\s*(số\s*\d+|line\s*\d+|chính thức|vận hành)/i, category: "infrastructure", impact: "high",   horizon: "short" },
  { kw: /tuyến\s*đường\s*sắt/i,                                category: "infrastructure", impact: "high",   horizon: "long"  },
  { kw: /vành\s*đai\s*[2-4]/i,                                 category: "infrastructure", impact: "high",   horizon: "medium"},
  { kw: /cao\s*tốc.*(hoàn thành|khởi công|thông xe)/i,         category: "infrastructure", impact: "high",   horizon: "medium"},
  { kw: /sân\s*bay/i,                                          category: "infrastructure", impact: "high",   horizon: "medium"},
  { kw: /cầu\s+(thủ thiêm|phú mỹ|cát lái|cần giờ|nhật tân)/i,  category: "infrastructure", impact: "high",   horizon: "medium"},
  // Infrastructure — medium
  { kw: /mở\s*rộng\s*(đường|tuyến|quốc lộ)/i,                  category: "infrastructure", impact: "medium", horizon: "short" },
  { kw: /thông\s*xe|hoàn\s*thành.*đường/i,                     category: "infrastructure", impact: "medium", horizon: "short" },
  // Legal
  { kw: /lên\s*quận|nâng\s*lên\s*quận/i,                       category: "legal",          impact: "high",   horizon: "short" },
  { kw: /sổ\s*hồng.*(cấp|trao|bàn giao)/i,                     category: "legal",          impact: "high",   horizon: "short" },
  { kw: /quy\s*hoạch.*(phê duyệt|điều chỉnh|công bố)/i,        category: "legal",          impact: "medium", horizon: "medium"},
  // Commercial
  { kw: /aeon|vincom|vinmart|lotte|gigamall|trung tâm thương mại/i, category: "commercial", impact: "medium", horizon: "short" },
  { kw: /mall\s+(mới|mở|khai trương)/i,                        category: "commercial",     impact: "medium", horizon: "short" },
  { kw: /trường\s+(quốc tế|liên cấp)/i,                        category: "commercial",     impact: "medium", horizon: "medium"},
  { kw: /bệnh\s*viện\s*(quốc tế|đa khoa)/i,                    category: "commercial",     impact: "medium", horizon: "medium"},
  // Economic
  { kw: /khu\s*công\s*nghiệp|khu\s*công\s*nghệ\s*cao/i,        category: "economic",       impact: "medium", horizon: "long"  },
  { kw: /dân\s*cư.*(lấp đầy|tăng|đông đúc)/i,                  category: "economic",       impact: "low",    horizon: "long"  },
  { kw: /giá\s*tăng|tăng\s*giá/i,                              category: "economic",       impact: "low",    horizon: "short" },
];

function classify(title) {
  for (const r of RULES) {
    if (r.kw.test(title)) {
      return { category: r.category, impact: r.impact, horizon: r.horizon };
    }
  }
  return null;
}

// ============================================================
// Fetch Google News RSS for a query
// ============================================================
async function fetchNews(query) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=vi&gl=VN&ceid=VN:vi`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
    if (!res.ok) return [];
    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    const items = [];
    $("item").each((_, el) => {
      const title = $(el).find("title").text().trim();
      const link = $(el).find("link").text().trim();
      const pubDate = $(el).find("pubDate").text().trim();
      if (title) items.push({ title, link, pubDate });
    });
    return items;
  } catch (err) {
    console.warn(`  ⚠️  fetchNews failed for "${query}":`, err.message);
    return [];
  }
}

// ============================================================
// Process one project
// ============================================================
async function processProject(p) {
  console.log(`\n📍 ${p.name} (${p.slug})`);
  const queries = [
    `"${p.name}" hạ tầng`,
    `"${p.name}" metro`,
    `"${p.name}" pháp lý`,
    `${p.district} ${p.city} quy hoạch`,
  ];

  const seen = new Set();
  let inserted = 0;

  for (const q of queries) {
    const items = await fetchNews(q);
    for (const item of items.slice(0, 8)) {
      if (seen.has(item.title)) continue;
      seen.add(item.title);

      const cls = classify(item.title);
      if (!cls) continue;

      // Compute expected_date heuristic from horizon
      const now = new Date();
      const offsetMonths = cls.horizon === "short" ? 6 : cls.horizon === "medium" ? 24 : 48;
      now.setMonth(now.getMonth() + offsetMonths);
      const expectedDate = now.toISOString().slice(0, 10);

      console.log(`  [${cls.category}/${cls.impact}/${cls.horizon}] ${item.title.slice(0, 100)}`);

      if (!DRY_RUN) {
        const { error } = await supabase
          .from("project_catalysts")
          .insert({
            project_id: p.id,
            title: item.title.slice(0, 200),
            category: cls.category,
            impact: cls.impact,
            status: "rumor", // crawled news = rumor until manually confirmed
            horizon: cls.horizon,
            expected_date: expectedDate,
            source_url: item.link,
            description: `Tự động phát hiện từ tin tức${item.pubDate ? ` (${item.pubDate})` : ""}`,
          });
        if (!error) inserted++;
        else if (!error.message?.includes("duplicate")) {
          console.warn(`    ⚠️  insert failed:`, error.message);
        }
      }
    }
    // Be nice
    await new Promise((r) => setTimeout(r, 800));
  }

  console.log(`  → Inserted ${inserted} new catalysts`);
  return inserted;
}

// ============================================================
// Main
// ============================================================
(async () => {
  let query = supabase.from("projects").select("id, name, slug, district, city").limit(LIMIT);
  if (SLUG_FILTER) query = query.eq("slug", SLUG_FILTER);

  const { data: projects, error } = await query;
  if (error) { console.error("Failed to load projects:", error); process.exit(1); }

  console.log(`🚀 Catalyst crawl starting for ${projects.length} project(s) ${DRY_RUN ? "(DRY RUN)" : ""}\n`);

  let total = 0;
  for (const p of projects) {
    total += await processProject(p);
  }

  console.log(`\n✅ Done. Total inserted: ${total}`);
})();
