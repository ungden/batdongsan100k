# Multi-source Crawl System

This folder now has a repeatable source probe so we can re-check which public sources are still crawlable before building or running adapters.

## Command

Run the probe without writing a file:

```bash
npm run probe:sources
```

Run the probe and persist the latest report:

```bash
npm run probe:sources:write
```

Run the real multi-source crawler:

```bash
npm run crawl:multi -- --pages=1 --per-source=8 --max-age-days=30 --download-images
```

Run a safe insert dry-run from crawler output:

```bash
npm run insert:multi -- --input=output/new-sources-images-test/multi-source-listings.json --dry-run
```

Run a real insert with Supabase credentials:

```bash
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run insert:multi -- --input=output/new-sources-images-test/multi-source-listings.json
```

Legacy insert scripts were also aligned to the same Supabase project and now read credentials from environment variables instead of hardcoded project values.

Output file:

- `source-probe-report.json`
- `output/multi-source-*/multi-source-listings.json`
- `output/multi-source-*/multi-source-manifest.json`
- `output/multi-source-*/images/` when `--download-images` is enabled

## Current source buckets

Ready now over plain HTTP:

- `chotot_api`: public JSON API, easiest source.
- `alonhadat`: server-rendered HTML listing pages.
- `homedy`: server-rendered HTML listing pages.
- `meeyland`: server-rendered HTML listing pages.

Additional candidates verified manually:

- `mogi.vn`: listing pages and detail pages return HTML and real image URLs.
- `123nhadatviet.net`: listing pages and detail pages return HTML and full-size local image URLs.
- `odt.vn`: listing pages and detail pages return HTML and image URLs.
- `muonnha.com.vn`: listing pages and detail pages return HTML and CDN image URLs.
- `nhadat.cafeland.vn`: listing pages and detail pages return HTML and image URLs.

Lower-priority candidate:

- `rongbay.com`: listing pages respond, but sample extraction is noisier and needs a source-specific parser.

Blocked on plain HTTP fetch:

- `batdongsan`: Cloudflare challenge.
- `muaban`: Cloudflare challenge.
- `nhatot`: Cloudflare challenge.

## Probe rules

Each source probe records:

- listing page or API status
- robots.txt status and snippet
- whether plain HTTP fetch is blocked
- whether we can extract 5 sample items from the response

Verdicts:

- `ready`: plain HTTP fetch works and sample listings are extractable
- `partial`: source responds but parser needs more work
- `blocked`: source requires browser automation or bypass work

## Recommended implementation order

1. Keep `chotot_api` as the anchor source because it is structured and stable.
2. Add production adapters for `alonhadat`, `homedy`, and `meeyland` next.
3. Only touch `batdongsan`, `muaban`, and `nhatot` if we decide to invest in browser automation, rotating sessions, or another compliant access path.

## Current production crawler

`multi-source-crawl.mjs` now supports:

- `chotot_api` with direct JSON images
- `alonhadat` from listing pages with thumbnail images
- `homedy` from listing pages plus detail pages for richer images
- `meeyland` from listing pages plus detail pages for richer images
- `mogi` from listing pages plus detail pages
- `odt` from listing pages plus detail pages
- `muonnha` from listing pages plus detail pages
- `cafeland` from listing pages plus detail pages

Important limitation:

- `alonhadat` detail pages may trigger captcha, so that adapter currently keeps listing-page thumbnail images instead of full gallery images.
- The crawler is now strict on recency: it only keeps listings with a detectable publish date within `--max-age-days` days. Default is `30`.
- If a source response does not expose a trustworthy publish date, that listing is skipped instead of being guessed.
- `meeyland` still has stricter date extraction than the others; if publish date is not clearly detectable, the listing is skipped.

## Date fields in output

Each listing now includes both machine-readable and user-friendly date fields:

- `published_at`: normalized ISO datetime used for filtering and sorting
- `age_days`: numeric age in days
- `posted_date`: display date in `dd/mm/yyyy`
- `posted_label`: friendly recency label such as `Hôm nay`, `Hôm qua`, `3 ngày trước`, `1 tuần trước`
- `source_posted_text`: raw date text captured from the source when available
- `is_latest`: `true` when listing age is `<= 1` day
- `freshness_bucket`: one of `today`, `yesterday`, `last_3_days`, `last_week`, `last_2_weeks`, `last_month`
- `freshness_rank`: numeric freshness score for frontend sort and badge priority

For latest-first UX, prefer sorting by:

1. `published_at` descending
2. fallback to `age_days` ascending
3. optionally boost items with `is_latest = true` or higher `freshness_rank`

## Suggested adapter contract

Each future source adapter should expose the same shape:

```js
{
  source: 'homedy',
  title,
  price,
  price_formatted,
  price_unit,
  type,
  category,
  address,
  district,
  city,
  area,
  bedrooms,
  bathrooms,
  floor,
  direction,
  description,
  images,
  features,
  contact_name,
  contact_phone,
  external_url,
  external_id,
}
```

## Dedup recommendation

Use a source-independent dedup key before insert:

```text
normalize(title) + normalize(district) + rounded(price) + rounded(area)
```

Fallback if title quality is poor:

```text
normalize(address) + rounded(price) + rounded(area)
```

The production crawler now uses multiple dedup keys at crawl time and insert time:

- `title + district + price + area`
- `title + city + price + area`
- `address + price + area`
- `title + address`

## Before building a real adapter

1. Run `npm run probe:sources:write`.
2. Confirm source verdict is still `ready`.
3. Open `source-probe-report.json` and inspect the extracted samples.
4. Only then implement or refresh the real crawler for that source.
