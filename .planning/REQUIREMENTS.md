# Requirements

## V1 Scope

### Database & Tiers (DB, PKG)
- **DB-01**: Create database schema for `packages` (available tiers).
- **DB-02**: Create database schema for `user_packages` (user purchases/subscriptions).
- **DB-03**: Update `listings` table for VIP status and `last_pushed_at` timestamp.
- **DB-04**: Create `push_history` table for tracking "Push to Top" events.
- **PKG-01**: Configure system with Basic, Silver (Tăng Cường), and Gold (Nâng Cao) tiers with distinct push frequency configurations.

### Automation (AUTO)
- **AUTO-01**: Implement Supabase Edge Functions or pg_cron to automatically execute "Push to Top" on a schedule based on the listing's package tier.

### User Interface (UI)
- **UI-01**: Build UI for users to browse and compare VIP packages (Pricing/Tier selection).
- **UI-02**: Build checkout/upgrade flow for purchasing a package for a specific listing.
- **UI-03**: Build dashboard UI to view current listing VIP status, push history, and next scheduled push.

### Search & Discovery (SEARCH)
- **SEARCH-01**: Modify search and list queries to primarily sort by VIP tier (Gold > Silver > Basic).
- **SEARCH-02**: Modify search and list queries to secondarily sort by `last_pushed_at` timestamp (descending).

## V2 Scope (Out of bounds)
- Subscription auto-renewal billing.
- Analytics dashboard for push conversion tracking.
- Granular manual push purchases (pay-per-push).

## Traceability
| Requirement | Phase | Status |
|-------------|-------|--------|
| DB-01 | Phase 1 | Pending |
| DB-02 | Phase 1 | Pending |
| DB-03 | Phase 1 | Pending |
| DB-04 | Phase 1 | Pending |
| PKG-01 | Phase 1 | Pending |
| UI-01 | Phase 2 | Pending |
| UI-02 | Phase 2 | Pending |
| AUTO-01 | Phase 3 | Pending |
| UI-03 | Phase 3 | Pending |
| SEARCH-01 | Phase 4 | Pending |
| SEARCH-02 | Phase 4 | Pending |
