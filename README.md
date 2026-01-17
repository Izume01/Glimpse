# Orbital

A real-time telemetry dashboard for SaaS applications. This project provides a 3D visualization of active user sessions and allows for granular inspection of individual user events as they occur.

## Overview

Orbital is designed for founders and operators who require immediate visibility into their user base. While traditional analytics focus on historical reporting, Orbital focuses on live activity, bridging the gap between geographic distribution and specific user behavior.

## Core Functionality

- **Live Global Visualization**: A WebGL-powered 3D globe rendering active user sessions with sub-second latency.
- **User Inspection**: Selection of any active node on the globe opens a dedicated stream showing real-time event logs for that specific user session.
- **Event Attribution**: Direct mapping of custom application events (e.g., signups, API calls, errors) to geographic coordinates.
- **Persistent Monitoring**: A dedicated interface mode optimized for continuous display on secondary monitors or office dashboards.

## Technical Architecture

| Component | Technology |
|-----------|-----------|
| Frontend | Next.js, React |
| Rendering | Three.js / React Three Fiber |
| Data Transport | WebSockets for real-time event streaming |
| Mapping | GeoJSON and TopoJSON data for coordinate precision |
| Styling | Tailwind CSS (Dark Mode optimized) |
