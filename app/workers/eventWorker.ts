import { Worker } from "bullmq";
import { Queue } from "bullmq";
import geoLookupIp from "./lib/geolookupIp";
import type { GeoResult } from "./lib/geolookupIp";
import { redis } from "@glimpse/db/redis";
import type { AnalyticsEvent } from "@glimpse/shared/event.schema"
import { prisma } from "@glimpse/db/client";
import * as nodeCrypto from 'crypto';

interface BufferData {
    event: AnalyticsEvent;
    geo: GeoResult;
}

const redisPort = process.env.REDIS_PORT
    ? Number(process.env.REDIS_PORT)
    : 6379;

const eventBuffer: BufferData[] = [];
const MAX_BUFFER_SIZE = 100;
const BUFFER_FLUSH_INTERVAL = 1000;

let isFlushing = false;

const analyticsQueue = new Queue("analyticsQueue", {
    connection: {
        host: process.env.REDIS_HOST ?? "redis",
        port: redisPort,
    }
});

async function flushEventBuffer() {
    if (isFlushing) return;
    if (eventBuffer.length === 0) return;

    console.log("Flushing event buffer", eventBuffer.length);
    isFlushing = true;
    try {
        const batch = eventBuffer.splice(0, MAX_BUFFER_SIZE);

        await prisma.event.createMany({
            data: batch.map(({ event, geo }) => ({
                projectId: event.projectId,
                name: event.event,
                occurredAt: new Date(event.timestamp ?? Date.now()),

                anonymousId: event.anonymousId,
                userId: event.userId,
                sessionId: event.sessionId,

                traits: event.traits ?? undefined,
                properties: event.properties ?? undefined,
                context: event.context ?? undefined,

                ip: (event as any).meta?.ip ?? undefined,
                userAgent: (event as any).meta?.userAgent ?? undefined,

                country: geo?.country ?? undefined,
                region: geo?.region ?? undefined,
                city: geo?.city ?? undefined,
                timezone: geo?.timezone ?? undefined,
                lat: geo?.lat ?? undefined,
                lon: geo?.lon ?? undefined,
            })),
        });
    } catch (error) {
        console.error("Failed to flush event buffer to DB:", error);
    } finally {
        isFlushing = false;
    }
}

setInterval(() => {
    void flushEventBuffer();
}, BUFFER_FLUSH_INTERVAL);

const eventWorker = new Worker(
    "eventQueue",
    async job => {
        switch (job.name) {
            case "ingest-event":
                const eventData = job.data;

                let sessionId = eventData.sessionId;
                let anonymousId = eventData.anonymousId;

                if (!anonymousId) {
                    const ip = (eventData.meta as any)?.ip || "unknown";
                    const ua = (eventData.meta as any)?.userAgent || "unknown";
                    const hash = nodeCrypto.createHash('sha256').update(`${ip}-${ua}`).digest('hex');
                    anonymousId = `anon_${hash.substring(0, 16)}`;
                    eventData.anonymousId = anonymousId;
                }

                if (!sessionId) {
                    const hour = new Date(eventData.timestamp ?? Date.now()).toISOString().split('T')[0] + '-' + new Date(eventData.timestamp ?? Date.now()).getHours();
                    const hash = nodeCrypto.createHash('sha256').update(`${anonymousId}-${hour}`).digest('hex');
                    sessionId = `sess_${hash.substring(0, 16)}`;
                    eventData.sessionId = sessionId;
                }

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

                const sessionKey = `session:${eventData.projectId}:${eventData.sessionId}`;

                const pipeline = redis.pipeline();

                pipeline.hset(sessionKey, {
                    country: geoData?.country ?? "unknown",
                    region: geoData?.region ?? "unknown",
                    city: geoData?.city ?? "unknown",
                    timezone: geoData?.timezone ?? "unknown",
                    lat: geoData?.lat ? geoData.lat.toString() : "0",
                    lon: geoData?.lon ? geoData.lon.toString() : "0",
                    lastEventTimestamp: String(eventData.timestamp ?? Date.now()),
                });

                pipeline.hincrby(sessionKey, "eventCount", 1);
                
                pipeline.expire(sessionKey, 2000);

                const activeSessionsKey = `active_sessions:${eventData.projectId}`;
                pipeline.sadd(activeSessionsKey, eventData.sessionId);
                pipeline.expire(activeSessionsKey, 2000);

                const results = await pipeline.exec();
                
                // hincrby is the 2nd command (index 1)
                const eventCountAfter = results ? results[1][1] as number : 2;
                
                let bounceDelta = 0;
                if (eventCountAfter === 1) {
                    bounceDelta = 1; // First event: assume bounce
                } else if (eventCountAfter === 2) {
                    bounceDelta = -1; // Second event: no longer a bounce
                }

                eventBuffer.push({
                    event: eventData,
                    geo: geoData,
                });

                await analyticsQueue.add("analytics-job", {
                    eventData,
                    geoData,
                    bounceDelta
                });


                if (eventBuffer.length >= MAX_BUFFER_SIZE) {
                    await flushEventBuffer();
                }

                // const activeUserInterval = setInterval(() => {
                //     void redis.scard(activeSessionsKey).then(activeUser => {
                //         console.log(
                //             `[LIVE] project=${eventData.projectId} activeUsers=${activeUser}`
                //         )
                //     });
                // }, 5000);
                
                break;

            default:
                console.warn(`No processor defined for job name: ${job.name}`);
        }
    },
    {
        concurrency: 10,
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