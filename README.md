
# 🌍 Glimpse

Real-time user analytics with live mapping and event visualization.

> **We track sessions, not people.**  
> **We visualize traffic, not identities.**

Glimpse helps you see what users are doing on your website or app right now. It shows you a live map with all active users and lets you watch what each person is doing as it happens. This helps you understand your users and react quickly.


## Overview

Glimpse is made for anyone who wants to know what’s happening on their site in real time. It’s simple: you see where your users are and what they’re doing, all live. No complicated analytics—just a clear view of your users right now.


## What Glimpse Does

- **Live Map**: See where your users are in the world, updated instantly.
- **Watch Users**: Click on any user to see what they’re doing right now.
- **See Events**: Watch when people sign up, use features, or run into errors, and see where it happens.
- **Always On**: Keep Glimpse open on a screen to always know what’s happening.




## Installation Guide

### Prerequisites

Before you begin, ensure you have the following installed:
- [Bun](https://bun.sh/) v1.3.6 or higher
- [PostgreSQL](https://www.postgresql.org/) 16 or higher
- [Redis](https://redis.io/) 7 or higher
- [Docker](https://www.docker.com/) and Docker Compose (for Docker installation)
- [MaxMind GeoLite2 License Key](https://www.maxmind.com/en/geolite2/signup) (free account)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/app"

# Redis Configuration
REDIS_HOST="localhost"
REDIS_PORT="6379"

# MaxMind GeoLite2 License Key (for IP geolocation)
GEOLITE_LICENSE_KEY="your_maxmind_license_key_here"
```

> **Note:** Get your free MaxMind license key from [MaxMind's website](https://www.maxmind.com/en/geolite2/signup)

---

## Option 1: Docker Installation (Local Development)

This is the recommended method for local development as it sets up all services automatically.

### Steps:

1. **Clone the repository:**
	```sh
	git clone https://github.com/Izume01/Glimpse.git
	cd Glimpse
	```

2. **Create environment file:**
	```sh
	# Create .env file in the docker directory
	cd docker
	cat > .env << EOF
	GEOLITE_LICENSE_KEY=your_maxmind_license_key_here
	DATABASE_URL=postgresql://postgres:postgres@postgres:5432/app
	REDIS_HOST=redis
	REDIS_PORT=6379
	EOF
	```

3. **Build and start all services:**
	```sh
	docker-compose build
	docker-compose up
	```
	
	This will start:
	- API server on port 3000
	- Worker service for background jobs
	- PostgreSQL database on port 5432
	- Redis on port 6378 (mapped from 6379)

4. **Run Prisma migrations:**
	```sh
	# In a new terminal
	docker-compose exec api bun run prisma:migrate
	```

5. **Access the application:**
	- API: [http://localhost:3000](http://localhost:3000)
	- Frontend: You'll need to run the web application separately (see Option 2, section 3C)

---

## Option 2: Standalone Services Installation

For production or when you want to run services separately.

### 1. Clone and Install Dependencies

```sh
# Clone the repository
git clone https://github.com/Izume01/Glimpse.git
cd Glimpse

# Install dependencies with Bun
bun install

# Update GeoIP database with your MaxMind license key
cd node_modules/geoip-lite && npm run updatedb license_key=YOUR_MAXMIND_LICENSE_KEY
cd ../..
```

> **Important:** After running `bun install`, you must update the GeoIP database with your MaxMind license key for IP geolocation to work properly.

### 2. Setup Prisma

```sh
# Generate Prisma Client
bun run prisma:generate

# Run database migrations
bun run prisma:migrate

# (Optional) Open Prisma Studio to view your database
bun run prisma:studio
```

### 3. Running Services Individually

#### A. API Service

The API service handles all HTTP requests and WebSocket connections.

```sh
# Development mode with hot reload
bun run dev

# Or directly run
bun --watch run index.ts
```

The API will be available at `http://localhost:3000`

#### B. Worker Service

The worker service processes background jobs and events.

```sh
# Development mode with hot reload
bun run worker

# Or directly run
bun --watch run workers.ts
```

#### C. Frontend/Web Application

The web application is a Next.js app located in `app/web/`.

```sh
# Navigate to web directory
cd app/web

# Install dependencies (if not already done)
bun install

# Development mode
bun run dev

# Production build
bun run build
bun run start
```

The web app will be available at `http://localhost:3001` (or another available port if 3000 is already in use by the API)

### 4. Running All Services Together

For development, you can run services in separate terminals:

```sh
# Terminal 1: API Service (runs on port 3000)
bun run dev

# Terminal 2: Worker Service
bun run worker

# Terminal 3: Web Application (runs on port 3001 to avoid port conflict)
cd app/web && PORT=3001 bun run dev
```

> **Note:** The API runs on port 3000, so the web application uses port 3001 to avoid conflicts.

---

## Post-Installation Steps

### Update GeoIP Database

After installation, update the GeoIP database for accurate IP geolocation:

```sh
cd node_modules/geoip-lite
npm run updatedb license_key=YOUR_MAXMIND_LICENSE_KEY
cd ../..
```

This should be done:
- After initial installation
- Periodically to keep geolocation data up to date (monthly recommended)

### Verify Installation

1. Check that PostgreSQL is running and accessible
2. Check that Redis is running and accessible
3. Verify API is responding: `curl http://localhost:3000`
4. Open the web interface and check the live map

---

## Update Guide

To update Glimpse to the latest version:

1. Pull the latest changes:
	```sh
	git pull origin main
	```
2. Rebuild and restart the Docker containers:
    ```sh
    docker-compose build
    docker-compose up -d
    ```
3. Restart the development server.
4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the updated version.
5. Enjoy the latest features and improvements!

## Technical Architecture

| Component      | Technology                              |
|--------------- |-----------------------------------------|
| Frontend       | Next.js, React                          |
| Rendering      | Three.js, React Three Fiber             |
| Data Transport | WebSockets for real-time event streaming |
| Mapping        | GeoJSON, TopoJSON                       |
| Styling        | Tailwind CSS (Dark Mode optimized)      |

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

