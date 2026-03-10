# Ski Trip Organizer — CLAUDE.md

## Project Overview

A full-stack web app that organizes complete ski trip packages. Users fill in a preference wizard (resort, dates, budget, hotel stars, flight type, ground transport), and the app queries live travel APIs to find and combine the best flights, ground transport, and hotels into 3–5 ranked package options with total pricing. Users can register, log in, and save their favorite packages.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Auth | NextAuth.js (Google OAuth + email/password) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma |
| Flight + Hotel data | Amadeus Self-Service API |
| Ground transport data | Rome2Rio API |
| Deployment | Vercel |
| Token cache (prod) | Upstash Redis |

---

## Key Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Generate Prisma client after schema changes
npx prisma generate

# Create and apply a new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations to production DB
npx prisma migrate deploy

# Open Prisma Studio (DB browser)
npx prisma studio

# Build for production
npm run build
```

---

## Project Structure

```
ski_trip_proj/
├── CLAUDE.md                        # This file
├── .env.local                       # Local secrets (never commit)
├── .env.example                     # Template for required env vars
├── prisma/schema.prisma             # Database schema (all tables)
├── data/ski-resorts.json            # Curated resort → airport mapping (~100 resorts)
└── src/
    ├── app/
    │   ├── (auth)/login/ + register/ # Auth pages
    │   ├── search/page.tsx           # 6-step preference wizard
    │   ├── results/page.tsx          # Package results (polls backend)
    │   ├── dashboard/page.tsx        # Saved trips (protected route)
    │   └── api/
    │       ├── auth/[...nextauth]/   # NextAuth handler
    │       ├── search/               # POST: start a search session
    │       ├── packages/[sessionId]/ # GET: poll for aggregated results
    │       ├── resorts/              # GET: search ski-resorts.json
    │       └── saved-trips/          # GET/POST/DELETE saved trips
    ├── components/
    │   ├── wizard/                   # SearchWizard + 6 step components
    │   ├── results/                  # PackageCard + sub-components
    │   └── dashboard/                # SavedTripCard
    ├── lib/
    │   ├── amadeus/                  # API client + flights.ts + hotels.ts
    │   ├── rome2rio/                 # Ground transport API client
    │   ├── aggregator/packageBuilder.ts  # Core: combines all 3 data sources
    │   ├── resorts/loader.ts         # Loads ski-resorts.json
    │   ├── prisma.ts                 # Prisma client singleton
    │   └── auth.ts                   # NextAuth config
    ├── types/                        # TypeScript types for all data models
    └── hooks/                        # useWizardState, usePackages, useResortSearch
```

---

## Core Data Flow

```
1. User completes wizard → POST /api/search
       ↓
2. Server creates SearchSession row (status=PENDING)
   Triggers packageBuilder in background (waitUntil)
       ↓
3. packageBuilder loads the resort from ski-resorts.json
   Gets ALL nearby airports for that resort (e.g. Val Thorens → LYS, GVA, TRN)
       ↓
4. For EACH airport, in parallel:
   ├── Amadeus: flights from departure city → this airport
   └── Rome2Rio: transfer cost + time from this airport → resort
       ↓
5. Also in parallel:
   └── Amadeus: hotels near resort (filtered by user's star rating)
       ↓
6. All combinations computed across ALL airports:
     flight(via LYS) + transfer(LYS→resort) + hotel = total
     flight(via GVA) + transfer(GVA→resort) + hotel = total
     flight(via TRN) + transfer(TRN→resort) + hotel = total
   The winning airport is determined by cheapest TOTAL (not shortest distance)
       ↓
7. Filter by budget → score → pick top 3–5 packages
   Each result shows WHICH airport was used and why it was chosen
   Save to SearchSession.packages (JSON), set status=COMPLETED
       ↓
8. Results page polls GET /api/packages/[sessionId] every 2.5s
   Renders PackageCard components when COMPLETED
       ↓
9. User clicks "Save" → POST /api/saved-trips (auth required)
   Snapshot stored in SavedTrip table → visible in Dashboard
```

### Key principle: cheapest arrival, not closest airport

A cheaper flight via a farther airport can still be the best deal once transfer cost is added. Example for Val Thorens:

| Airport | Flight cost | Transfer cost | **Total arrival** |
|---|---|---|---|
| Lyon (LYS) | $180 | $60 | **$240** ← cheapest |
| Geneva (GVA) | $150 | $110 | **$260** |
| Turin (TRN) | $200 | $45 | **$245** |

The app computes all three and picks the cheapest total, not the closest airport.

---

## Group Travel Logic (1–10 people)

Group size affects every component of the package differently. The app must handle all three layers correctly.

### Flights
- Amadeus `adults` parameter is set to the group size
- Airlines price per seat, so `totalFlightCost = pricePerPerson × groupSize`
- For groups >9, Amadeus requires a different endpoint (group fares) — for now cap at 9 and show a note for 10
- Budget comparison uses **total group cost**, not per-person: a $500/person budget for 6 people = $3,000 total flight budget

### Hotels — room configuration
A group does not always need N separate rooms. The app calculates the minimum number of rooms needed and searches accordingly:

| Group size | Default room config |
|---|---|
| 1–2 | 1 double room |
| 3–4 | 1 family room or 2 doubles |
| 5–6 | 2 doubles + 1 single, or 3 doubles |
| 7–10 | Multiple rooms; also search for chalets/apartments |

- Amadeus hotel search accepts `adults` and `roomQuantity` parameters
- For groups of 6+, also search for **ski chalets or apartments** (more cost-effective and practical)
- Hotel total = `pricePerRoom × rooms × nights` (not per person)

### Ground Transport — vehicle sizing
A single taxi fits 3–4 people. Larger groups need different vehicles:

| Group size | Transport options |
|---|---|
| 1–4 | Standard taxi / private car |
| 5–8 | Minivan / shared shuttle |
| 9–10 | Minibus or 2× minivans |

- Rome2Rio returns per-vehicle prices; the app calculates how many vehicles are needed: `Math.ceil(groupSize / vehicleCapacity)`
- Total transport cost = `vehiclePrice × numberOfVehicles`
- For groups 6+, shared shuttle or bus becomes significantly cheaper per person — this is highlighted in the results

### Pricing display
Results always show **both** views:
- Per-person cost (for easy comparison)
- Total group cost (flight + transport + hotel combined)

Example for 6 people, Val Thorens, 7 nights:
```
Flight (6 × $180)       = $1,080
Transfer (1 minivan)    =    $90
Hotel (3 rooms × 7n)    = $1,260
─────────────────────────────────
Total                   = $2,430   ($405 per person)
```

---

## How APIs Work

The app uses **official travel APIs**, not web scraping. These are the same data backends that power Google Flights, Kayak, and Booking.com.

### Amadeus (Flights + Hotels)
- Auth: OAuth2 client credentials (POST to get a 30-min bearer token)
- Token is cached server-side only — never exposed to browser
- Flight search: `GET /v2/shopping/flight-offers` with origin IATA, destination IATA, dates, `adults=groupSize`, cabin class
- Hotel search: `GET /v1/reference-data/locations/hotels/by-geocode` → `GET /v3/shopping/hotel-offers` with `adults` and `roomQuantity` computed from group size
- **Use test environment** (`test.api.amadeus.com`) during development; switch to `api.amadeus.com` for production

### Rome2Rio (Ground Transport)
- Provides car, bus, train, shuttle options between two places
- Called with airport city name + resort name from `ski-resorts.json`
- Returns route options with prices and durations

### ski-resorts.json (Static curated data)
- Maps each resort to **all realistic arrival airports** (typically 2–4 airports per resort)
- Each airport entry stores: IATA code, drive distance in km, estimated drive time in minutes
- The app checks flights + transfers for ALL listed airports — the winner is cheapest total, not closest
- Also stores lat/lng center for hotel search and Rome2Rio place names
- Example: Val Thorens lists LYS (Lyon), GVA (Geneva), TRN (Turin)
- ~80–120 resorts across Alps, N. America, Scandinavia, Japan, Andes

---

## Database Tables

| Table | Purpose |
|---|---|
| `User` | Registered users |
| `Account` | OAuth provider links (NextAuth) |
| `Session` | Active sessions (NextAuth) |
| `VerificationToken` | Email verification tokens (NextAuth) |
| `SearchSession` | One record per search; stores all inputs + aggregated results as JSON |
| `SavedTrip` | User-saved package snapshots (denormalized for price preservation) |

---

## Environment Variables

Create `.env.local` with:

```bash
# Database (Supabase)
DATABASE_URL="postgresql://..."         # Connection pooler (port 6543)
DIRECT_URL="postgresql://..."           # Direct connection for migrations

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET=""                      # Generate: openssl rand -base64 32

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Amadeus API (from developers.amadeus.com)
AMADEUS_CLIENT_ID=""
AMADEUS_CLIENT_SECRET=""
AMADEUS_BASE_URL="https://test.api.amadeus.com"   # Use https://api.amadeus.com in prod

# Rome2Rio API (from rome2rio.com/documentation/api)
ROME2RIO_API_KEY=""
ROME2RIO_BASE_URL="https://free.rome2rio.com/api/1.4/json"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Redis (production only — for Amadeus token caching)
UPSTASH_REDIS_REST_URL=""
UPSTASH_REDIS_REST_TOKEN=""
```

**Security:** Only `NEXT_PUBLIC_APP_URL` is exposed to the browser. All API keys must remain server-side (no `NEXT_PUBLIC_` prefix).

---

## Package Scoring Logic

Each valid package (within user budget) is scored:

```
score = (1 - normalizedPrice) × 0.40       # cheaper total = higher score
      + directFlightBonus × 0.20            # +1 if direct, 0 if not
      + normalizedHotelStars × 0.30         # higher stars = higher score
      + timeOfDayMatchBonus × 0.10          # +1 if flight matches preferred window
```

- `normalizedPrice` is the **total group cost** (not per person) — normalized across all airport options
- This means a "cheap flight + expensive transfer" competes fairly against "pricier flight + cheap transfer"
- Budget filtering compares `totalGroupCost` against `userBudgetPerPerson × groupSize`
- Each displayed package card shows **which airport** was used (e.g. "Fly into Lyon → 1h15 transfer to Val Thorens"), vehicle type, room count, and both per-person and total group price
- Top 3–5 packages by score are shown. If fewer than 3 results exist, budget relaxes by 10% and re-runs once.

---

## Critical Files

| File | Why it matters |
|---|---|
| `prisma/schema.prisma` | Must be set up first — all API routes depend on the generated Prisma client |
| `data/ski-resorts.json` | Accurate IATA codes and airport distances drive all flight + transport queries |
| `src/lib/amadeus/client.ts` | Token management — all Amadeus calls depend on this auth layer |
| `src/lib/aggregator/packageBuilder.ts` | Core business logic — most complex file; orchestrates all 3 API calls and scoring |
| `src/components/wizard/SearchWizard.tsx` | Top-level wizard state manager — parent of all 6 step components |
