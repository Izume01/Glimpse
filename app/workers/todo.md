# 🧾 Tomorrow's TODO — Worker + Live State (Core Day)

## 🔒 Context (Read Once Tomorrow)

- ✅ Ingestion API is DONE
- ✅ Events are flowing into BullMQ
- ✅ Redis & Postgres are running
- **Goal tomorrow:** make events come alive

## ✅ TODO List (Do in Order)


### ⬜ 0. Before Anythin
- [x] Make a function to get the ip from the headers
- [x] Pass the ip as `meta` when adding job to BullMQ in the API

### ⬜ 1. Create Worker Process

**File:** `apps/worker/index.ts`

- [x] Create BullMQ Worker
- [x] Connect to same Redis as API
- [x] Listen to `"ingest-event"`
- [x] For now: `console.log(event)`

> **Goal:** see events printed when you hit `/events`

### ⬜ 2. Extract Session Info From Event

From each event:
- `projectId`
- `sessionId`
- `userId`
- `timestamp`

If `sessionId` is missing:
- Generate one (UUID)
- Attach it internally

### ⬜ 3. Extract IP (From Queue Meta)

- [ ] Read `meta.ip`
- [ ] Do NOT store raw IP anywhere
- [ ] Pass IP only to geo lookup

### ⬜ 4. Geo Lookup (Worker Only)

- [ ] Install `geoip-lite` or maxmind
- [ ] Convert IP → `{ country, city, lat, lon }`
- [ ] If lookup fails → ignore (don't crash)

### ⬜ 5. Update Redis Session State

**Key:** `session:{projectId}:{sessionId}`

**Store:**
- `userId`
- `lastSeen`
- `country`
- `city`
- `lat`
- `lon`

**Set TTL:** 300 seconds

### ⬜ 6. Update Active Sessions Set

**Key:** `active_sessions:{projectId}`

- [ ] `SADD sessionId`
- [ ] `EXPIRE 300`

### ⬜ 7. Push Event to In-Memory Buffer

- [ ] Create buffer: `AnalyticsEvent[]`
- [ ] Push each event
- [ ] Don't write to Postgres yet

### ⬜ 8. Log Active User Count (Sanity Check)

After Redis update:
- `SCARD active_sessions:{projectId}`
- `console.log(activeUsers)`

> **This confirms live state works.**

---

## 🛑 Stop Here Tomorrow

**Do NOT:**
- Write to Postgres
- Add batching logic
- Add SSE
- Touch frontend

**That's Day 3 / Worker v1 done.**
dsf