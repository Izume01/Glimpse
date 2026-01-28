# Glimpse - Project Structure

## Root Level Files
```
├── Dockerfile               # Docker configuration for containerization
├── .dockerignore            # Files to ignore in Docker builds
├── .gitignore               # Git ignore rules
├── .git/                    # Git repository
├── index.ts                 # Main entry point
├── workers.ts               # Workers configuration
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── bun.lock                 # Bun package lock file
├── PROJECT_OUTLINE.md       # Project outline documentation
├── PROJECT_STRUCTURE.md     # This file - project structure documentation
├── README.md                # Project README
└── node_modules/            # Installed dependencies
```

## `/app` - Application Directory

### `/app/api` - API Layer
```
app/api/
├── app.ts                   # Main API application setup
├── controller/
│   └── event.controller.ts  # Event controller - handles event requests
├── routes/
│   └── event.route.ts       # Event routing configuration
└── services/
    └── event.service.ts     # Event service - business logic
```

### `/app/workers` - Background Workers
```
app/workers/
├── eventWorker.ts           # Event processing worker
├── todo.md                  # Worker TODO list
└── lib/
    ├── geolookupIp.ts       # IP geolocation utility
    └── lru.ts               # Least Recently Used cache implementation
```

## `/packages` - Shared Packages

### `/packages/analytics-web` - Web Analytics SDK
```
packages/analytics-web/
├── index.js                 # Package entry point
├── core/
│   ├── event.js             # Event core functionality
│   └── session.js           # Session management
├── events/
│   ├── auto.js              # Automatic event tracking
│   ├── track.js             # Manual event tracking
│   └── trackonView.js       # View tracking events
└── transport/
    └── sender.js            # Event sender/transport layer
```

### `/packages/db` - Database Package
```
packages/db/
├── client.ts                # Database client initialization
└── prisma/
    ├── prisma.config.ts     # Prisma configuration
    └── schema.prisma        # Prisma database schema
```

### `/packages/shared` - Shared Utilities
```
packages/shared/
├── event.schema.ts          # Event data schema definitions
├── zod.schema.ts            # Zod validation schemas
└── lib/
    ├── getIp.ts             # IP address utility
    └── redis.ts             # Redis client/utilities
```

## `/docker` - Docker Configuration
```
docker/
├── docker-compose.yml       # Docker Compose configuration
└── .env                     # Environment variables for Docker
```

## `/test` - Testing & Demo
```
test/
├── demo.html                # HTML demo page
├── fire_event.sh            # Script to fire test events
└── Usage.md                 # Usage documentation for testing
```

---

## Architecture Overview

### Directory Purpose

- **App Layer**: Core application code split into API handlers and background workers
- **Packages**: Modular packages for:
  - **analytics-web**: Frontend/client-side analytics SDK
  - **db**: Database abstraction and schema management
  - **shared**: Cross-cutting concerns and utilities
- **Docker**: Container orchestration and deployment configuration
- **Test**: Testing utilities and documentation

### Technology Stack (Inferred)
- **Language**: TypeScript
- **Runtime**: Bun (based on bun.lock)
- **Database**: Prisma ORM
- **Validation**: Zod
- **Caching**: Redis, LRU Cache
- **Containers**: Docker & Docker Compose
