import { Worker } from "bullmq";
import geoLookupIp from "./lib/geolookupIp";
import type { GeoResult } from "./lib/geolookupIp";
import { redis } from "@glimpse/db/redis";
import type {AnalyticsEvent} from "@glimpse/shared/event.schema"
import crypto from 'bun'

interface BufferData {
    event: AnalyticsEvent;
    geo: GeoResult;
}

const redisPort = process.env.REDIS_PORT
    ? Number(process.env.REDIS_PORT)
    : 6379;

const eventBuffer : BufferData[] = [];
const MAX_BUFFER_SIZE = 100;
const BUFFER_FLUSH_INTERVAL = 5000; 

const eventWorker = new Worker(
    "eventQueue",
    async job => {
        switch (job.name) {
            case "ingest-event":
                const eventData = job.data;

                if (!eventData.sessionId) {
                    eventData.sessionId = crypto.randomUUIDv7();
                }

                // We will be doing  the Database part here 
                // TODO: store in DB, analytics pipeline, etc

                // --------------------------------------------

                // Now here we will be doing Extract IP , Geolookup and then storing it in the redis with a set ttl
                let geoData: GeoResult = null;
                const ipAddress = eventData.meta?.ip;
                if (ipAddress) {
                    try {
                        geoData = await geoLookupIp(ipAddress);
                    } catch (error) {
                        console.error(`Failed to lookup geolocation for IP ${ipAddress}:`, error);
                    }
                } else {
                    console.warn("No IP address provided in event data");
                }

                // session store 
                const sessionKey = `session:${eventData.projectId}:${eventData.sessionId}`;

                await redis.hset(sessionKey, {
                    country: geoData?.country ?? "unknown",
                    region: geoData?.region ?? "unknown",
                    city: geoData?.city ?? "unknown",
                    timezone: geoData?.timezone ?? "unknown",
                    lat: geoData?.lat ? geoData.lat.toString() : "0",
                    lon: geoData?.lon ? geoData.lon.toString() : "0",
                    lastEventTimestamp: String(eventData.timestamp ?? Date.now()),

                })

                await redis.expire(sessionKey, 300);

                // active sessions
                const activeSessionsKey = `active_sessions:${eventData.projectId}`;
                await redis.sadd(activeSessionsKey, eventData.sessionId);
                await redis.expire(activeSessionsKey, 300);


                eventBuffer.push({
                    event: eventData,
                    geo: geoData,
                })

                // active user
                const activeUser = await redis.scard(activeSessionsKey);
                
                console.log(
                    `[LIVE] project=${eventData.projectId} activeUsers=${activeUser}`
                );

                break;
            default:
                console.warn(`No processor defined for job name: ${job.name}`);
        }
    },
    {
        connection: {
            host: process.env.REDIS_HOST ?? "redis",
            port: redisPort,
        }
    }
)

eventWorker.on("ready", () => {
    console.log("Worker is connected to Redis and ready to process jobs");
});

eventWorker.on("completed", job => {
    console.log(`Job with id ${job.id} has been completed`);
});

eventWorker.on("failed", (job, err) => {
    console.error(`Job with id ${job?.id} has failed with error ${err.message}`);
});

eventWorker.on("error", err => {
    console.error("Worker error:", err);
});

export default eventWorker;