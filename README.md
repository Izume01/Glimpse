
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




## Setup Guide (Docker)

To run Glimpse locally using Docker:

1. **Clone the repository:**
	```sh
	git clone https://github.com/your-org/glimpse.git
	cd glimpse
	```
2. **Go to the Docker folder:**
	```sh
	cd docker
	```
3. **Configure environment variables:**
	- Copy `.env` to `.env.local` (if needed) and update all required values, especially any credentials or IDs (e.g., `MAXMIND_ACCOUNT_ID`, etc.).
4. **Build and start the containers:**
	```sh
	docker-compose build
	docker-compose up
	```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

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

