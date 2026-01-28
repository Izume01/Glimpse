# Glimpse - Project Outline

## Project Overview

**Glimpse** is a real-time user analytics platform with live mapping and event visualization. It tracks sessions (not individuals) and visualizes traffic patterns globally, allowing users to see what's happening on their website or app in real-time through an interactive live map and event dashboard.

**Core Philosophy**: Track sessions, not people. Visualize traffic, not identities.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend Runtime** | Bun (TypeScript) |
| **Frontend** | Next.js, React |
| **Real-time Communication** | WebSockets |
| **Data Queue** | BullMQ (Redis-backed) |
| **Database Cache** | Redis |
| **Geolocation** | MaxMind GeoIP Lite |
| **HTTP Framework** | Hono |
| **Styling** | Tailwind CSS (Dark Mode) |
| **3D Visualization** | Three.js, React Three Fiber |
| **Mapping** | GeoJSON, TopoJSON |
| **Schema Validation** | Zod |

---

## Project Structure

```
Glimpse/
├── 📦 Root Level
│   ├── index.ts                 # Main entry point
│   ├── workers.ts               # Worker initialization
│   ├── package.json             # Project dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── Dockerfile               # Docker image definition
│   └── README.md                # Project documentation
│
├── 🐳 docker/
│   └── docker-compose.yml       # Docker compose orchestration
│
├── 📁 app/
│   ├── 🔌 api/
│   │   ├── app.ts               # Express/Hono app initialization
│   │   ├── controller/
│   │   │   └── event.controller.ts  # Event handling logic
│   │   ├── routes/
│   │   │   └── event.route.ts       # Event API routes
│   │   └── services/
│   │       └── event.service.ts     # Event business logic
│   │
│   └── 🔄 workers/
│       ├── eventWorker.ts       # BullMQ event processing worker
│       ├── lib/
│       │   ├── geolookupIp.ts   # GeoIP lookup service
│       │   └── lru.ts           # LRU cache implementation
│       └── todo.md              # Worker development notes
│
├── 📦 packages/
│   ├── 🔄 shared/
│   │   ├── event.schema.ts      # Zod event schema definitions
│   │   ├── zod.schema.ts        # Additional schema definitions
│   │   └── lib/
│   │       ├── getIp.ts         # IP extraction utility
│   │       └── redis.ts         # Redis client initialization
│   │
│   └── 💻 analytics-web/
│       ├── index.js             # Web SDK entry point
│       ├── core/
│       │   ├── event.js         # Event core logic
│       │   └── session.js       # Session management
│       ├── events/
│       │   ├── auto.js          # Automatic event tracking
│       │   ├── track.js         # Manual event tracking
│       │   └── trackonView.js   # View tracking
│       └── transport/
│           └── sender.js        # Event transport/sending
│
└── 🧪 test/
    ├── demo.html                # Demo HTML page
    ├── fire_event.sh            # Event testing script
    └── Usage.md                 # Usage documentation
```

---

## Core Components

### 1. **Backend API** (`app/api/`)

**Purpose**: HTTP/WebSocket endpoint for receiving analytics events from client applications.

- **app.ts**: Main Hono application with CORS support
  - Health check endpoint: `GET /check`
  - Event routes: `POST /event`
  - IP extraction endpoint: `GET /`

- **event.route.ts**: Route definitions for event handling
  
- **event.controller.ts**: Request/response handling logic
  
- **event.service.ts**: Core business logic for event processing

**Key Features**:
- CORS enabled for cross-origin requests
- IP address extraction from request headers
- Event validation and routing

### 2. **Worker System** (`app/workers/`)

**Purpose**: Asynchronous event processing using BullMQ (Redis-backed job queue).

- **eventWorker.ts**: Main worker process
  - Processes `ingest-event` jobs
  - Generates session IDs (UUID v7)
  - Performs geolocation lookups
  - Stores session data in Redis
  - Tracks active sessions per project
  - Buffers events for batch processing
  - Logs live user counts

- **lib/geolookupIp.ts**: GeoIP lookup service
  - Returns: country, region, city, timezone, lat/lon
  - Caches results for performance
  
- **lib/lru.ts**: LRU (Least Recently Used) cache
  - Optimization for repeated geolocation queries

**Job Processing Flow**:
1. Job name validation
2. Generate session ID if missing
3. Extract IP from event metadata
4. Lookup geolocation data
5. Store session info in Redis (300s TTL)
6. Add to active sessions set
7. Buffer event for batch processing
8. Log active user count

### 3. **Shared Utilities** (`packages/shared/`)

**Purpose**: Shared code between frontend and backend.

- **event.schema.ts**: 
  - `AnalyticsEvent`: Core event interface with:
    - Project identification
    - Event tracking (event name, timestamp)
    - User/Session identification
    - Event properties and traits
    - Context (URL, viewport, device, connection info)
  - `ExtendedAnalyticsEvent`: Adds IP and UserAgent metadata

- **lib/getIp.ts**: Extract client IP from request context

- **lib/redis.ts**: Redis client initialization and configuration

### 4. **Analytics Web SDK** (`packages/analytics-web/`)

**Purpose**: Client-side JavaScript SDK for tracking user analytics.

- **core/event.js**: Event creation and management
- **core/session.js**: Session lifecycle management
- **events/auto.js**: Automatic event tracking (page views, interactions)
- **events/track.js**: Manual event API for custom tracking
- **events/trackonView.js**: View-specific event tracking
- **transport/sender.js**: HTTP transport for sending events to backend

**Features**:
- Automatic session tracking
- Custom event tracking
- View/page tracking
- Event batching and transport

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Client)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         analytics-web SDK                             │  │
│  │  - Auto event tracking                                │  │
│  │  - Custom event tracking                              │  │
│  │  - Session management                                 │  │
│  └────────────────┬─────────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────────┘
                    │ HTTP POST /event
                    │ (with IP, UserAgent)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend API (Hono)                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Event Route Handler                                  │  │
│  │  - Extract IP from headers                            │  │
│  │  - Validate event schema (Zod)                        │  │
│  │  - Enqueue job to BullMQ                              │  │
│  └────────────────┬─────────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────────┘
                    │ BullMQ Job Queue
                    │ (ingest-event)
                    ▼
┌─────────────────────────────────────────────────────────────┐
│              BullMQ Event Worker                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Process ingest-event Jobs:                           │  │
│  │  1. Generate session ID (UUID v7)                     │  │
│  │  2. GeoIP lookup (with LRU cache)                     │  │
│  │  3. Store session in Redis                            │  │
│  │  4. Track active sessions                             │  │
│  │  5. Buffer events for batch processing                │  │
│  └────────┬─────────────────────────────────┬───────────┘  │
└───────────┼─────────────────────────────────┼───────────────┘
            │                                 │
    ┌───────▼────────────┐         ┌─────────▼──────────────┐
    │   Redis Store      │         │  Event Buffer (Memory) │
    │  - Sessions        │         │  - Batched events     │
    │  - Active users    │         │  - Flush every 5s     │
    │  - TTL: 300s       │         │  - Max: 100 events    │
    └────────────────────┘         └───────────────────────┘
            │
            │ (To be implemented)
            ▼
        Database
        Analytics Pipeline
```

---

## Key Features

### ✅ Session-Based Tracking
- UUID v7 session identifiers
- 300-second session timeout
- Per-project session isolation

### ✅ Real-Time Geolocation
- IP-based geolocation lookup
- LRU caching for performance
- Returns: Country, Region, City, Timezone, Lat/Lon

### ✅ Event Buffering
- In-memory event buffer
- Max 100 events before flush
- 5-second flush interval
- Batch processing ready

### ✅ Active Session Tracking
- Per-project active session count
- Real-time user count logging
- Redis-backed set operations

### ✅ Multi-Project Support
- Project-scoped data isolation
- Project-based event routing

---

## Environment Configuration

```env
REDIS_HOST=redis          # Redis server hostname
REDIS_PORT=6379          # Redis server port
MAXMIND_ACCOUNT_ID=...   # MaxMind GeoIP API credentials
```

---

## TODO & Roadmap

### Immediate (eventWorker.ts)
- [ ] Database integration for events
- [ ] Analytics pipeline implementation
- [ ] Event buffer flush logic
- [ ] Real-time WebSocket connection to frontend

### Planned Features
- [ ] Frontend dashboard (live map, user tracking)
- [ ] Event filtering and search
- [ ] Custom event segmentation
- [ ] User journey replay
- [ ] Performance metrics
- [ ] Advanced geolocation features

---

## Development Commands

```bash
# Start backend in watch mode
bun --watch run index.ts

# Start worker in watch mode
bun --watch run workers.ts

# Run with Docker
cd docker
docker-compose up

# Test events (shell script)
./test/fire_event.sh
```

---

## API Endpoints

### Health Check
```
GET /check
Response: { status: "ok" }
```

### IP & Headers Info
```
GET /
Response: { ip: "...", headers: {...} }
```

### Event Ingestion
```
POST /event
Body: AnalyticsEvent
Response: { success: true }
```

---

## Architecture Patterns

- **Queue-Based Processing**: BullMQ for reliable async event handling
- **Caching Strategy**: LRU cache for geolocation results
- **Data Isolation**: Project-scoped namespacing in Redis
- **Real-time First**: WebSocket-ready architecture
- **Type Safety**: TypeScript + Zod schema validation
- **Monorepo Structure**: Shared packages for code reuse

---

## Performance Considerations

1. **Geolocation Caching**: LRU cache reduces external API calls
2. **Event Buffering**: Batch processing reduces database load
3. **Session TTL**: 300-second expiration prevents Redis memory bloat
4. **BullMQ**: Built-in job retry and error handling
5. **Set Operations**: Redis SADD/SCARD for fast active user counting

---

## Security Notes

- ✅ CORS enabled for controlled cross-origin access
- ✅ IP extraction from headers (behind proxy support)
- ✅ Session ID anonymization (UUIDs, not user IDs)
- ✅ Project-based data isolation
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Event validation enhancements
- ⚠️ TODO: Authentication/Authorization

---

## Related Files

- [README.md](README.md) - Main project documentation
- [docker/docker-compose.yml](docker/docker-compose.yml) - Docker setup
- [test/Usage.md](test/Usage.md) - SDK usage guide
- [test/fire_event.sh](test/fire_event.sh) - Event testing script
- [app/workers/todo.md](app/workers/todo.md) - Worker development notes


In BOTH places (root + apps/web):

Add to package.json:

{
  "prisma": {
    "schema": "../../packages/db/prisma/schema.prisma"
  }
}


⚠️ Path differs slightly:

Root:

"schema": "packages/db/prisma/schema.prisma"


Frontend:

"schema": "../../packages/db/prisma/schema.prisma"