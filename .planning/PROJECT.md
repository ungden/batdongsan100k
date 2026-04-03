# Project: VIP Package System (Chotot Style)

## Core Value
Increase platform revenue and user engagement by allowing sellers to upgrade their listings to VIP tiers (Basic, Silver/Tăng Cường, Gold/Nâng Cao). VIP listings get automated "Push to Top" functionality and higher search visibility, resulting in faster sales.

## Target Audience
Property sellers who want more visibility for their listings.
Property buyers who want to see active, prioritized listings.

## Key Mechanics
1. **Tiered Packages**: Basic (Free/Standard), Silver (Tăng Cường), Gold (Nâng Cao).
2. **Automated Pushing**: System automatically bumps listings to the top of search results based on the package's frequency (e.g., Gold gets pushed more often than Silver).
3. **Search Priority**: Sort algorithm prioritizes VIP Tier first, then latest push timestamp.

## Constraints & Assumptions
- Built on Supabase (Postgres).
- Automation will leverage Supabase pg_cron or Edge Functions.
