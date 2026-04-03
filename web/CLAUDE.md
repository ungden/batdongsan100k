@AGENTS.md

# Project Context

This repo is the TitanHome web app built with Next.js 16 and Supabase.

Primary goals:

- show real-estate listings from Supabase
- support latest-first browsing UX
- allow admin moderation and management of listings
- keep public listings filters working end-to-end

Supabase project in active use:

- `https://grwuamsiofeubgefliea.supabase.co`

Main table expectations:

- `properties` stores published listings
- `agents` stores contact/agent records

# Listings Rules

The `/listings` page is important and should stay functional.

If you edit listings behavior, check both:

- `src/app/(public)/listings/page.tsx`
- `src/lib/queries/properties.ts`

Current supported filters:

- `type`
- `category`
- `city`
- `price`
- `area`
- `bedrooms`
- `direction`
- `feature`
- `sort`

If a filter is visible in the sidebar, it must also be applied in the query layer.

# Crawler Context

The crawler is part of this git repo and lives in:

- `crawler/`

It performs multi-source ingestion for the last 30 days and inserts into this repo's Supabase project.

Important crawler entrypoints:

- `crawler/multi-source-crawl.mjs`
- `crawler/insert-multi-source.mjs`
- `crawler/daily-sync.mjs`
- `crawler/SOURCE_SYSTEM.md`

Automation:

- `.github/workflows/daily-crawl.yml`

Do not remove or silently break compatibility with crawler-written listing data unless there is a clear migration plan.

# Working Style For Future Agents

- Verify the app builds after non-trivial changes.
- Be careful with `/listings`; it is easy to create UI-only filters that do nothing.
- Prefer minimal changes over broad rewrites.
- Preserve latest-first behavior for listing discovery.
