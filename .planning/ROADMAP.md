# Project Roadmap

## Phases
- [ ] **Phase 1: Database Foundation & Tiers** - Setup packages, schemas, and listing VIP fields
- [ ] **Phase 2: Purchase & Assignment UI** - Allow users to view and upgrade their listings
- [ ] **Phase 3: Automated Push Engine** - Implement scheduled push mechanics and user dashboard visibility
- [ ] **Phase 4: Search & Ranking Algorithm** - Prioritize VIPs and recently pushed listings in queries

## Phase Details

### Phase 1: Database Foundation & Tiers
**Goal**: The system can store and distinguish between different VIP packages, user purchases, and listing statuses.
**Depends on**: None
**Requirements**: DB-01, DB-02, DB-03, DB-04, PKG-01
**Success Criteria**:
1. Database contains seed data for Basic, Silver, and Gold packages with their respective configurations.
2. A user can have a package assigned to them in the database.
3. A listing can securely reference its current VIP status and last pushed timestamp.

**Plans**: TBD

### Phase 2: Purchase & Assignment UI
**Goal**: Users can view available packages and upgrade their listings to a VIP tier.
**Depends on**: Phase 1
**Requirements**: UI-01, UI-02
**Success Criteria**:
1. User can view a pricing page showing differences between Basic, Silver, and Gold.
2. User can successfully complete a checkout/upgrade flow for a specific listing.
3. Upgrading successfully updates the database to reflect the new tier for the listing.

**Plans**: TBD

### Phase 3: Automated Push Engine
**Goal**: Listings are automatically refreshed/pushed to the top according to their tier's schedule.
**Depends on**: Phase 1
**Requirements**: AUTO-01, UI-03
**Success Criteria**:
1. System automatically updates the `last_pushed_at` timestamp for active VIP listings based on configured frequency without manual intervention.
2. Push events are recorded in the `push_history` table for auditing.
3. Users can see when their listing was last pushed and when the next push is scheduled in their dashboard.

**Plans**: TBD

### Phase 4: Search & Ranking Algorithm
**Goal**: Consumers see listings ranked by VIP tier and freshness.
**Depends on**: Phase 1, Phase 3
**Requirements**: SEARCH-01, SEARCH-02
**Success Criteria**:
1. Gold listings consistently appear above Silver and Basic listings in default search results.
2. Recently pushed listings appear higher than older pushed listings within the same tier.
3. Standard (non-VIP) listings fall to the bottom naturally as VIPs are pushed.

**Plans**: TBD

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Database Foundation & Tiers | 0/0 | Not started | - |
| 2. Purchase & Assignment UI | 0/0 | Not started | - |
| 3. Automated Push Engine | 0/0 | Not started | - |
| 4. Search & Ranking Algorithm | 0/0 | Not started | - |
