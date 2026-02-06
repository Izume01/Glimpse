import { Worker } from "bullmq";
import { prisma } from "@glimpse/db/client.ts";
import type { AnalyticsEvent } from "@glimpse/shared/event.schema";

const redisPort = process.env.REDIS_PORT
    ? Number(process.env.REDIS_PORT)
    : 6379;

const redisConnection = {
    host: process.env.REDIS_HOST ?? "redis",
    port: redisPort,
};

const MAX_BUFFER_SIZE = 100;
const BUFFER_FLUSH_INTERVAL = 2000;

interface SessionBuffer {
    projectId: string;
    sessionId: string;
    anonymousId: string;
    userId: string | null;
    firstEventDate: Date;
    lastEventDate: Date;
    eventCount: number;
}

interface EventAggregateBuffer {
    projectId: string;
    date: Date;
    eventName: string;
    count: number;
    users: Set<string>;
    sessions: Set<string>;
}

interface PageAnalyticsBuffer {
    projectId: string;
    date: Date;
    pagePath: string;
    views: number;
    users: Set<string>;
    sessions: Set<string>;
}

interface UserAnalyticsBuffer {
    projectId: string;
    date: Date;
    anonymousId: string;
    sessions: Set<string>;
}

// In-memory buffers
const sessionBuffer = new Map<string, SessionBuffer>();
const eventAggregateBuffer = new Map<string, EventAggregateBuffer>();
const pageAnalyticsBuffer = new Map<string, PageAnalyticsBuffer>();
const userAnalyticsBuffer = new Map<string, UserAnalyticsBuffer>();

let isFlushing = false;
let bufferCount = 0;

async function flushBuffers() {
    if (isFlushing || bufferCount === 0) return;

    isFlushing = true;
    console.log(`Flushing analytics buffers (${bufferCount} events)`);

    try {
        // Flush sessions
        const sessionPromises = Array.from(sessionBuffer.values()).map(session =>
            prisma.analyticsSession.upsert({
                where: {
                    projectId_sessionId: {
                        sessionId: session.sessionId,
                        projectId: session.projectId,
                    }
                },
                create: {
                    sessionId: session.sessionId,
                    projectId: session.projectId,
                    anonymousId: session.anonymousId,
                    userId: session.userId,
                    startedAt: session.firstEventDate,
                    lastSeenAt: session.lastEventDate,
                    eventCount: session.eventCount,
                },
                update: {
                    lastSeenAt: session.lastEventDate,
                    eventCount: { increment: session.eventCount },
                    userId: session.userId ?? undefined,
                }
            })
        );

        const eventAggPromises = Array.from(eventAggregateBuffer.values()).map(agg =>
            prisma.dailyEventAggregate.upsert({
                where: {
                    projectId_date_eventName: {
                        projectId: agg.projectId,
                        date: agg.date,
                        eventName: agg.eventName,
                    }
                },
                create: {
                    projectId: agg.projectId,
                    date: agg.date,
                    eventName: agg.eventName,
                    count: agg.count,
                    users: agg.users.size,
                    sessions: agg.sessions.size,
                },
                update: {
                    count: { increment: agg.count },
                }
            })
        );

        const pagePromises = Array.from(pageAnalyticsBuffer.values()).map(page =>
            prisma.dailyPageAnalytics.upsert({
                where: {
                    projectId_date_pagePath: {
                        projectId: page.projectId,
                        date: page.date,
                        pagePath: page.pagePath,
                    }
                },
                create: {
                    projectId: page.projectId,
                    date: page.date,
                    pagePath: page.pagePath,
                    views: page.views,
                    uniqueUsers: page.users.size,
                    sessions: page.sessions.size,
                    bounces: 0,
                },
                update: {
                    views: { increment: page.views },
                }
            })
        );

        const userPromises = Array.from(userAnalyticsBuffer.values()).map(user =>
            prisma.dailyUserAnalytics.upsert({
                where: {
                    projectId_date_anonymousId: {
                        projectId: user.projectId,
                        date: user.date,
                        anonymousId: user.anonymousId,
                    }
                },
                create: {
                    projectId: user.projectId,
                    date: user.date,
                    anonymousId: user.anonymousId,
                    sessions: user.sessions.size,
                    isNew: true,
                },
                update: {
                    sessions: user.sessions.size,
                }
            })
        );

        await Promise.all([
            ...sessionPromises,
            ...eventAggPromises,
            ...pagePromises,
            ...userPromises,
        ]);

        // Clear buffers after successful flush
        sessionBuffer.clear();
        eventAggregateBuffer.clear();
        pageAnalyticsBuffer.clear();
        userAnalyticsBuffer.clear();
        bufferCount = 0;

        console.log("Analytics buffers flushed successfully");
    } catch (error) {
        console.error("Failed to flush analytics buffers:", error);
    } finally {
        isFlushing = false;
    }
}

function addToBuffer(eventData: AnalyticsEvent, geoData: { country?: string } | null) {
    const eventDate = new Date(eventData.timestamp ?? Date.now());
    const dateOnly = new Date(eventDate.toISOString().split('T')[0] || '');

    if (isNaN(dateOnly.getTime())) {
        throw new Error('Invalid date');
    }

    const dateStr = dateOnly.toISOString();

    const sessionKey = `${eventData.projectId}:${eventData.sessionId}`;
    const existingSession = sessionBuffer.get(sessionKey);
    if (existingSession) {
        existingSession.lastEventDate = eventDate;
        existingSession.eventCount++;
        if (eventData.userId) existingSession.userId = eventData.userId;
    } else {
        sessionBuffer.set(sessionKey, {
            projectId: eventData.projectId,
            sessionId: eventData.sessionId,
            anonymousId: eventData.anonymousId,
            userId: eventData.userId ?? null,
            firstEventDate: eventDate,
            lastEventDate: eventDate,
            eventCount: 1,
        });
    }

    const eventAggKey = `${eventData.projectId}:${dateStr}:${eventData.event}`;
    const existingEventAgg = eventAggregateBuffer.get(eventAggKey);
    if (existingEventAgg) {
        existingEventAgg.count++;
        existingEventAgg.users.add(eventData.anonymousId);
        existingEventAgg.sessions.add(eventData.sessionId);
    } else {
        eventAggregateBuffer.set(eventAggKey, {
            projectId: eventData.projectId,
            date: dateOnly,
            eventName: eventData.event,
            count: 1,
            users: new Set([eventData.anonymousId]),
            sessions: new Set([eventData.sessionId]),
        });
    }

    const pagePath = eventData.context?.path;
    if (pagePath) {
        const isPageView = eventData.event === 'pageview' || eventData.event === 'page';
        const pageKey = `${eventData.projectId}:${dateStr}:${pagePath}`;
        const existingPage = pageAnalyticsBuffer.get(pageKey);
        if (existingPage) {
            if (isPageView) existingPage.views++;
            existingPage.users.add(eventData.anonymousId);
            existingPage.sessions.add(eventData.sessionId);
        } else {
            pageAnalyticsBuffer.set(pageKey, {
                projectId: eventData.projectId,
                date: dateOnly,
                pagePath: pagePath,
                views: isPageView ? 1 : 0,
                users: new Set([eventData.anonymousId]),
                sessions: new Set([eventData.sessionId]),
            });
        }
    }

    const userKey = `${eventData.projectId}:${dateStr}:${eventData.anonymousId}`;
    const existingUser = userAnalyticsBuffer.get(userKey);
    if (existingUser) {
        existingUser.sessions.add(eventData.sessionId);
    } else {
        userAnalyticsBuffer.set(userKey, {
            projectId: eventData.projectId,
            date: dateOnly,
            anonymousId: eventData.anonymousId,
            sessions: new Set([eventData.sessionId]),
        });
    }

    bufferCount++;
}

const flushInterval = setInterval(() => {
    void flushBuffers();
}, BUFFER_FLUSH_INTERVAL);

const analyticsWorker = new Worker(
    "analyticsQueue",
    async (job) => {
        switch (job.name) {
            case "analytics-job":
                const { eventData, geoData } = job.data as {
                    eventData: AnalyticsEvent;
                    geoData: { country?: string } | null;
                };

                addToBuffer(eventData, geoData);

                if (bufferCount >= MAX_BUFFER_SIZE) {
                    await flushBuffers();
                }

                break;
            default:
                console.warn(`Unknown job type: ${job.name}`);
        }
    },
    {
        connection: redisConnection,
        concurrency: 5,
    }
);

analyticsWorker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

analyticsWorker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});

console.log("Analytics worker started");

process.on("SIGINT", async () => {
    console.log("Shutting down analytics worker...");
    clearInterval(flushInterval);
    await flushBuffers();
    await analyticsWorker.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down analytics worker...");
    clearInterval(flushInterval);
    await flushBuffers();
    await analyticsWorker.close();
    process.exit(0);
});

export default analyticsWorker;