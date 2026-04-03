# TitanHome Web

TitanHome is a Next.js 16 real-estate web application backed by Supabase. This repo contains the public website and admin dashboard used to browse, manage, and moderate property listings.

## Current Product Scope

- Public pages:
  - home page
  - listings page with filters and sorting
  - property detail page
  - public post submission flow
- Admin pages:
  - property management
  - agents
  - leads
  - analytics and settings

## Current Data Source

This web repo uses the Supabase project:

- `https://grwuamsiofeubgefliea.supabase.co`

The web app reads listings from the `properties` table and agent data from `agents`.

## Important Context

The multi-source crawler is now stored inside this repo at:

- `crawler/`

That crawler currently:

- crawls multiple sources
- keeps only listings from the last 30 days
- computes latest-first metadata such as `published_at`, `posted_label`, and `freshness_rank`
- inserts records into this web app's Supabase `properties` table

As of the current working state, the 30-day sync has already populated the database with a large batch of listings from:

- `chotot_api`
- `alonhadat`
- `homedy`
- `mogi`
- `odt`
- `muonnha`
- `cafeland`
- `meeyland`

## Listings Page

The listings page at `/listings` now supports real filtering and sorting through `getPublishedProperties(...)`.

Implemented filters:

- `type`
- `category`
- `city`
- `price`
- `area`
- `bedrooms`
- `direction`
- `feature`
- `sort`

Current sorting options:

- latest first
- price ascending
- price descending
- area descending

## Repo Structure

- `src/`: web app code
- `crawler/`: multi-source real-estate crawler and Supabase insert pipeline
- `.github/workflows/daily-crawl.yml`: daily automation for crawl + insert

## Local Development

Install dependencies and run the app:

```bash
npm install
npm run dev
```

Build for production:

```bash
npm run build
```

Crawler commands:

```bash
cd crawler
npm install
npm run probe:sources
npm run crawl:multi -- --crawl-all-recent --max-age-days=30 --max-pages=60
npm run insert:multi -- --input=output/<run>/multi-source-listings.json --dry-run
```

## Environment

Expected local environment file:

- `.env.local`

At minimum, the app uses:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Daily Sync

Daily sync is configured in:

- `.github/workflows/daily-crawl.yml`

Required GitHub secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The daily job runs the crawler for the last 30 days and inserts new records into the `properties` table.

## Notes For Future Work

- Prefer latest-first real-estate UX: show newest listings first.
- Keep `/listings` filters in sync between UI controls and query logic.
- The crawler is now versioned in `crawler/` and should stay aligned with Supabase schema changes.
- If the UI shows a filter, it should also be applied in `src/lib/queries/properties.ts`.
