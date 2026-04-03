import { writeFileSync } from "fs";
import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36";

const WRITE_REPORT = process.argv.includes("--write");

const SOURCES = [
  {
    key: "chotot_api",
    name: "Cho Tot Public API",
    kind: "json",
    strategy: "API",
    homepage: "https://www.chotot.com/",
    robots: "https://www.chotot.com/robots.txt",
    probeUrl:
      "https://gateway.chotot.com/v1/public/ad-listing?cg=1010&limit=5&o=0&st=s&region_v2=13000",
  },
  {
    key: "alonhadat",
    name: "Alonhadat",
    kind: "html",
    strategy: "HTML SSR",
    homepage: "https://alonhadat.com.vn/",
    robots: "https://alonhadat.com.vn/robots.txt",
    probeUrl: "https://alonhadat.com.vn/can-ban-nha-dat/ha-noi",
  },
  {
    key: "homedy",
    name: "Homedy",
    kind: "html",
    strategy: "HTML SSR",
    homepage: "https://homedy.com/",
    robots: "https://homedy.com/robots.txt",
    probeUrl: "https://homedy.com/ban-nha-dat",
  },
  {
    key: "meeyland",
    name: "Meey Land",
    kind: "html",
    strategy: "HTML SSR",
    homepage: "https://meeyland.com/",
    robots: "https://meeyland.com/robots.txt",
    probeUrl: "https://meeyland.com/mua-ban-nha-dat-a4",
  },
  {
    key: "batdongsan",
    name: "Batdongsan.com.vn",
    kind: "html",
    strategy: "Needs browser bypass",
    homepage: "https://batdongsan.com.vn/",
    robots: "https://batdongsan.com.vn/robots.txt",
    probeUrl: "https://batdongsan.com.vn/ban-nha-dat",
  },
  {
    key: "muaban",
    name: "Muaban.net",
    kind: "html",
    strategy: "Needs browser bypass",
    homepage: "https://muaban.net/",
    robots: "https://muaban.net/robots.txt",
    probeUrl: "https://muaban.net/bat-dong-san",
  },
  {
    key: "nhatot",
    name: "Nha Tot",
    kind: "html",
    strategy: "Needs browser bypass",
    homepage: "https://www.nhatot.com/",
    robots: "https://www.nhatot.com/robots.txt",
    probeUrl: "https://www.nhatot.com/",
  },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "user-agent": USER_AGENT,
      accept: "text/html,application/json;q=0.9,*/*;q=0.8",
      "accept-language": "vi,en-US;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
    },
  });

  return {
    status: response.status,
    ok: response.ok,
    contentType: response.headers.get("content-type") || "",
    finalUrl: response.url,
    text: await response.text(),
  };
}

function detectChallenge(text) {
  const lowered = text.toLowerCase();
  if (lowered.includes("just a moment") || lowered.includes("cf-browser-verification")) {
    return "cloudflare";
  }
  if (lowered.includes("access denied") || lowered.includes("forbidden")) {
    return "access_denied";
  }
  return null;
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function extractPrice(text) {
  const match = text.match(/(\d+[\d.,]*\s*(?:tỷ|triệu|tr|usd))/i);
  return match ? normalizeWhitespace(match[1]) : null;
}

function extractArea(text) {
  const match = text.match(/(\d+[\d.,]*\s*(?:m²|m2))/i);
  return match ? normalizeWhitespace(match[1]) : null;
}

function absoluteUrl(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return href;
  }
}

function sampleFromChotot(text) {
  const payload = JSON.parse(text);
  const ads = Array.isArray(payload.ads) ? payload.ads : [];
  return ads.slice(0, 5).map((ad) => ({
    title: ad.subject || null,
    price: ad.price_string || null,
    area: ad.size ? `${ad.size} m2` : null,
    location: [ad.area_name, ad.region_name_v3 || ad.region_name].filter(Boolean).join(", "),
    url: ad.list_id ? `https://www.chotot.com/mua-ban-bat-dong-san/${ad.list_id}.htm` : null,
  }));
}

function sampleFromAlonhadat(baseUrl, html) {
  const $ = cheerio.load(html);
  return $("article.property-item")
    .slice(0, 5)
    .toArray()
    .map((element) => {
      const article = $(element);
      const href = article.find("a[itemprop='url']").attr("href") || "";
      const title = normalizeWhitespace(article.find("h3[itemprop='name']").text());
      const detailText = normalizeWhitespace(article.find(".property-details").text());
      const address = normalizeWhitespace(article.find(".property-address").text());
      const newAddress = normalizeWhitespace(article.find(".new-address").text());
      const oldAddress = normalizeWhitespace(article.find(".old-address").text());

      return {
        title,
        price: extractPrice(detailText),
        area: extractArea(detailText),
        location: newAddress || oldAddress || address || null,
        url: absoluteUrl(baseUrl, href),
      };
    })
    .filter((item) => item.title && item.url);
}

function sampleFromHomedy(baseUrl, html) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const samples = [];

  $("a[href]").each((_, element) => {
    if (samples.length >= 5) {
      return false;
    }

    const href = $(element).attr("href") || "";
    const title = normalizeWhitespace($(element).text());
    if (!/\/ban\-.*\-es\d+$/i.test(href) || title.length < 20 || seen.has(href)) {
      return;
    }

    const context = normalizeWhitespace($(element).parent().parent().text());
    seen.add(href);
    samples.push({
      title,
      price: extractPrice(context),
      area: extractArea(context),
      location: context.match(/(Hà Nội|Hồ Chí Minh|Đồng Nai|Bình Dương|Đà Nẵng|Cần Thơ|Hải Phòng)[^\n]*/)?.[0] || null,
      url: absoluteUrl(baseUrl, href),
    });
  });

  return samples;
}

function sampleFromMeeyland(baseUrl, html) {
  const $ = cheerio.load(html);
  const seen = new Set();
  const samples = [];

  $("a[href]").each((_, element) => {
    if (samples.length >= 5) {
      return false;
    }

    const href = $(element).attr("href") || "";
    const text = normalizeWhitespace($(element).text());
    if (!/\/ban\-[^/]+\/[0-9]+$/i.test(href) || text.length < 20 || seen.has(href)) {
      return;
    }

    seen.add(href);
    samples.push({
      title: text.slice(0, 160),
      price: extractPrice(text),
      area: extractArea(text),
      location: text.match(/(Q\.|H\.|Tp\.|T\.)[^\d]{1,80}/)?.[0] || null,
      url: absoluteUrl(baseUrl, href),
    });
  });

  return samples;
}

function buildSamples(source, text) {
  if (source.key === "chotot_api") {
    return sampleFromChotot(text);
  }
  if (source.key === "alonhadat") {
    return sampleFromAlonhadat(source.homepage, text);
  }
  if (source.key === "homedy") {
    return sampleFromHomedy(source.homepage, text);
  }
  if (source.key === "meeyland") {
    return sampleFromMeeyland(source.homepage, text);
  }
  return [];
}

function verdictFromProbe(probe, samples) {
  if (probe.ok && samples.length > 0) {
    return {
      verdict: "ready",
      reason: "Simple HTTP fetch returns parseable listing data.",
    };
  }

  const challenge = detectChallenge(probe.text);
  if (probe.status === 403 || challenge) {
    return {
      verdict: "blocked",
      reason: challenge === "cloudflare"
        ? "Blocked by Cloudflare challenge on plain HTTP fetch."
        : "Blocked by server on plain HTTP fetch.",
    };
  }

  return {
    verdict: "partial",
    reason: "Fetch succeeded but parser did not extract stable samples yet.",
  };
}

async function probeSource(source) {
  const [probe, robots] = await Promise.all([
    fetchText(source.probeUrl),
    fetchText(source.robots).catch((error) => ({
      status: null,
      ok: false,
      contentType: "",
      finalUrl: source.robots,
      text: String(error),
    })),
  ]);

  const samples = probe.ok ? buildSamples(source, probe.text) : [];
  const verdict = verdictFromProbe(probe, samples);

  return {
    key: source.key,
    name: source.name,
    strategy: source.strategy,
    kind: source.kind,
    probeUrl: source.probeUrl,
    homepage: source.homepage,
    probeStatus: probe.status,
    probeOk: probe.ok,
    finalUrl: probe.finalUrl,
    contentType: probe.contentType,
    robotsStatus: robots.status,
    robotsSnippet: normalizeWhitespace((robots.text || "").slice(0, 220)),
    verdict: verdict.verdict,
    reason: verdict.reason,
    sampleCount: samples.length,
    samples,
    blockedBy: detectChallenge(probe.text),
  };
}

function printSummary(report) {
  console.log("\nMulti-source probe summary\n");
  for (const item of report.sources) {
    console.log(
      [
        `- ${item.key}`,
        `status=${item.probeStatus}`,
        `verdict=${item.verdict}`,
        `samples=${item.sampleCount}`,
        `strategy=${item.strategy}`,
      ].join(" | "),
    );
    console.log(`  reason: ${item.reason}`);
  }
}

async function main() {
  const startedAt = new Date().toISOString();
  const sources = [];

  for (const source of SOURCES) {
    const result = await probeSource(source);
    sources.push(result);
    await sleep(250);
  }

  const report = {
    generatedAt: startedAt,
    readySources: sources.filter((item) => item.verdict === "ready").map((item) => item.key),
    blockedSources: sources.filter((item) => item.verdict === "blocked").map((item) => item.key),
    sources,
  };

  printSummary(report);

  if (WRITE_REPORT) {
    writeFileSync("source-probe-report.json", JSON.stringify(report, null, 2));
    console.log("\nWrote source-probe-report.json");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
