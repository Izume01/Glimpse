import { Worker } from "bullmq";
import { prisma } from "@glimpse/db/client.ts";
import type { AnalyticsEvent } from "@glimpse/shared/event.schema";
import { UAParser } from "ua-parser-js";

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
    timestamp: Date;
    eventName: string;
    count: number;
    users: Set<string>;
    sessions: Set<string>;
    _prevUsers: number;
    _prevSessions: number;
}

interface PageAnalyticsBuffer {
    projectId: string;
    timestamp: Date;
    pagePath: string;
    views: number;
    entrances: number;
    exits: number;
    duration: number;
    bounces: number;
    users: Set<string>;
    sessions: Set<string>;
    _prevUsers: number;
    _prevSessions: number;
}

interface UserAnalyticsBuffer {
    projectId: string;
    timestamp: Date;
    anonymousId: string;
    sessions: Set<string>;
    _prevSessions: number;
}

interface ReferrerAnalyticsBuffer {
    projectId: string;
    timestamp: Date;
    referrer: string;
    views: number;
    users: Set<string>;
    sessions: Set<string>;
    _prevUsers: number;
    _prevSessions: number;
}

interface DeviceAnalyticsBuffer {
    projectId: string;
    timestamp: Date;
    deviceType: string;
    browser: string;
    os: string;
    users: Set<string>;
    sessions: Set<string>;
    _prevUsers: number;
    _prevSessions: number;
}

interface CountryAnalyticsBuffer {
    projectId: string;
    timestamp: Date;
    country: string;
    region: string;
    city: string;
    users: Set<string>;
    sessions: Set<string>;
    _prevUsers: number;
    _prevSessions: number;
}

interface CampaignAnalyticsBuffer {
    projectId: string;
    timestamp: Date;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    utmTerm: string;
    utmContent: string;
    views: number;
    users: Set<string>;
    sessions: Set<string>;
    _prevUsers: number;
    _prevSessions: number;
}

interface SiteMetricsBuffer {
    projectId: string;
    timestamp: Date;
    visitors: Set<string>;
    views: number;
    sessions: Set<string>;
    bounces: number;
    totalDuration: number;
    _prevVisitors: number;
    _prevSessions: number;
}

// In-memory buffers
const sessionBuffer = new Map<string, SessionBuffer>();
const eventAggregateBuffer = new Map<string, EventAggregateBuffer>();
const pageAnalyticsBuffer = new Map<string, PageAnalyticsBuffer>();
const userAnalyticsBuffer = new Map<string, UserAnalyticsBuffer>();
const referrerAnalyticsBuffer = new Map<string, ReferrerAnalyticsBuffer>();
const deviceAnalyticsBuffer = new Map<string, DeviceAnalyticsBuffer>();
const countryAnalyticsBuffer = new Map<string, CountryAnalyticsBuffer>();
const campaignAnalyticsBuffer = new Map<string, CampaignAnalyticsBuffer>();
const siteMetricsBuffer = new Map<string, SiteMetricsBuffer>();

let isFlushing = false;
let bufferCount = 0;

function parseUtm(urlStr: string) {
    try {
        const url = new URL(urlStr);
        return {
            utmSource: url.searchParams.get('utm_source') || 'Direct',
            utmMedium: url.searchParams.get('utm_medium') || 'None',
            utmCampaign: url.searchParams.get('utm_campaign') || 'None',
            utmTerm: url.searchParams.get('utm_term') || 'None',
            utmContent: url.searchParams.get('utm_content') || 'None',
        };
    } catch {
        return { utmSource: 'Direct', utmMedium: 'None', utmCampaign: 'None', utmTerm: 'None', utmContent: 'None' };
    }
}

async function flushBuffers() {
    if (isFlushing || bufferCount === 0) return;

    isFlushing = true;
    console.log(`Flushing analytics buffers (${bufferCount} events)`);

    try {
        // Flush sessions (only those with pending events)
        const sessionPromises = Array.from(sessionBuffer.values())
            .filter(s => s.eventCount > 0)
            .map(session =>
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

        const eventAggPromises = Array.from(eventAggregateBuffer.values()).map(agg => {
            const usersDelta = agg.users.size - agg._prevUsers;
            const sessionsDelta = agg.sessions.size - agg._prevSessions;
            return prisma.hourlyEventAggregate.upsert({
                where: {
                    projectId_timestamp_eventName: {
                        projectId: agg.projectId,
                        timestamp: agg.timestamp,
                        eventName: agg.eventName,
                    }
                },
                create: {
                    projectId: agg.projectId,
                    timestamp: agg.timestamp,
                    eventName: agg.eventName,
                    count: agg.count,
                    users: agg.users.size,
                    sessions: agg.sessions.size,
                },
                update: {
                    count: { increment: agg.count },
                    users: { increment: usersDelta },
                    sessions: { increment: sessionsDelta },
                }
            });
        });

        const pagePromises = Array.from(pageAnalyticsBuffer.values()).map(page => {
            const usersDelta = page.users.size - page._prevUsers;
            const sessionsDelta = page.sessions.size - page._prevSessions;
            return prisma.hourlyPageAnalytics.upsert({
                where: {
                    projectId_timestamp_pagePath: {
                        projectId: page.projectId,
                        timestamp: page.timestamp,
                        pagePath: page.pagePath,
                    }
                },
                create: {
                    projectId: page.projectId,
                    timestamp: page.timestamp,
                    pagePath: page.pagePath,
                    views: page.views,
                    uniqueUsers: page.users.size,
                    sessions: page.sessions.size,
                    bounces: page.bounces,
                    entrances: page.entrances,
                    exits: page.exits,
                    duration: page.duration,
                },
                update: {
                    views: { increment: page.views },
                    entrances: { increment: page.entrances },
                    exits: { increment: page.exits },
                    duration: { increment: page.duration },
                    bounces: { increment: page.bounces },
                    uniqueUsers: { increment: usersDelta },
                    sessions: { increment: sessionsDelta },
                }
            });
        });

        const userPromises = Array.from(userAnalyticsBuffer.values()).map(user => {
            const sessionsDelta = user.sessions.size - user._prevSessions;
            return prisma.hourlyUserAnalytics.upsert({
                where: {
                    projectId_timestamp_anonymousId: {
                        projectId: user.projectId,
                        timestamp: user.timestamp,
                        anonymousId: user.anonymousId,
                    }
                },
                create: {
                    projectId: user.projectId,
                    timestamp: user.timestamp,
                    anonymousId: user.anonymousId,
                    sessions: user.sessions.size,
                    isNew: true,
                },
                update: {
                    sessions: { increment: sessionsDelta },
                }
            });
        });

        const referrerPromises = Array.from(referrerAnalyticsBuffer.values()).map(ref => {
            const usersDelta = ref.users.size - ref._prevUsers;
            const sessionsDelta = ref.sessions.size - ref._prevSessions;
            return prisma.hourlyReferrerAnalytics.upsert({
                where: {
                    projectId_timestamp_referrer: {
                        projectId: ref.projectId,
                        timestamp: ref.timestamp,
                        referrer: ref.referrer,
                    }
                },
                create: {
                    projectId: ref.projectId,
                    timestamp: ref.timestamp,
                    referrer: ref.referrer,
                    views: ref.views,
                    uniqueUsers: ref.users.size,
                    sessions: ref.sessions.size,
                },
                update: {
                    views: { increment: ref.views },
                    uniqueUsers: { increment: usersDelta },
                    sessions: { increment: sessionsDelta },
                }
            });
        });

        const devicePromises = Array.from(deviceAnalyticsBuffer.values()).map(dev => {
            const usersDelta = dev.users.size - dev._prevUsers;
            const sessionsDelta = dev.sessions.size - dev._prevSessions;
            return prisma.hourlyDeviceAnalytics.upsert({
                where: {
                    projectId_timestamp_deviceType_browser_os: {
                        projectId: dev.projectId,
                        timestamp: dev.timestamp,
                        deviceType: dev.deviceType,
                        browser: dev.browser,
                        os: dev.os,
                    }
                },
                create: {
                    projectId: dev.projectId,
                    timestamp: dev.timestamp,
                    deviceType: dev.deviceType,
                    browser: dev.browser,
                    os: dev.os,
                    uniqueUsers: dev.users.size,
                    sessions: dev.sessions.size,
                },
                update: {
                    uniqueUsers: { increment: usersDelta },
                    sessions: { increment: sessionsDelta },
                }
            });
        });

        const countryPromises = Array.from(countryAnalyticsBuffer.values()).map(geo => {
            const usersDelta = geo.users.size - geo._prevUsers;
            const sessionsDelta = geo.sessions.size - geo._prevSessions;
            return prisma.hourlyCountryAnalytics.upsert({
                where: {
                    projectId_timestamp_country_region_city: {
                        projectId: geo.projectId,
                        timestamp: geo.timestamp,
                        country: geo.country,
                        region: geo.region,
                        city: geo.city,
                    }
                },
                create: {
                    projectId: geo.projectId,
                    timestamp: geo.timestamp,
                    country: geo.country,
                    region: geo.region,
                    city: geo.city,
                    uniqueUsers: geo.users.size,
                    sessions: geo.sessions.size,
                },
                update: {
                    uniqueUsers: { increment: usersDelta },
                    sessions: { increment: sessionsDelta },
                }
            });
        });

        const campaignPromises = Array.from(campaignAnalyticsBuffer.values()).map(camp => {
            const usersDelta = camp.users.size - camp._prevUsers;
            const sessionsDelta = camp.sessions.size - camp._prevSessions;
            return prisma.hourlyCampaignAnalytics.upsert({
                where: {
                    projectId_timestamp_utmSource_utmMedium_utmCampaign_utmTerm_utmContent: {
                        projectId: camp.projectId,
                        timestamp: camp.timestamp,
                        utmSource: camp.utmSource,
                        utmMedium: camp.utmMedium,
                        utmCampaign: camp.utmCampaign,
                        utmTerm: camp.utmTerm,
                        utmContent: camp.utmContent,
                    }
                },
                create: {
                    projectId: camp.projectId,
                    timestamp: camp.timestamp,
                    utmSource: camp.utmSource,
                    utmMedium: camp.utmMedium,
                    utmCampaign: camp.utmCampaign,
                    utmTerm: camp.utmTerm,
                    utmContent: camp.utmContent,
                    views: camp.views,
                    uniqueUsers: camp.users.size,
                    sessions: camp.sessions.size,
                },
                update: {
                    views: { increment: camp.views },
                    uniqueUsers: { increment: usersDelta },
                    sessions: { increment: sessionsDelta },
                }
            });
        });

        const sitePromise = Array.from(siteMetricsBuffer.values()).map(site => {
            const visitorsDelta = site.visitors.size - site._prevVisitors;
            const sessionsDelta = site.sessions.size - site._prevSessions;
            return prisma.hourlySiteMetrics.upsert({
                where: {
                    projectId_timestamp: {
                        projectId: site.projectId,
                        timestamp: site.timestamp,
                    }
                },
                create: {
                    projectId: site.projectId,
                    timestamp: site.timestamp,
                    visitors: site.visitors.size,
                    views: site.views,
                    sessions: site.sessions.size,
                    bounces: site.bounces,
                    totalDuration: site.totalDuration,
                },
                update: {
                    visitors: { increment: visitorsDelta },
                    views: { increment: site.views },
                    sessions: { increment: sessionsDelta },
                    bounces: { increment: site.bounces },
                    totalDuration: { increment: site.totalDuration },
                }
            });
        });

        await Promise.all([
            ...sessionPromises,
            ...eventAggPromises,
            ...pagePromises,
            ...userPromises,
            ...referrerPromises,
            ...devicePromises,
            ...countryPromises,
            ...campaignPromises,
            ...sitePromise,
        ]);

        // Reset additive counters and update _prev tracking (keep Sets for unique accuracy)
        for (const s of sessionBuffer.values()) s.eventCount = 0;
        for (const agg of eventAggregateBuffer.values()) {
            agg._prevUsers = agg.users.size;
            agg._prevSessions = agg.sessions.size;
            agg.count = 0;
        }
        for (const page of pageAnalyticsBuffer.values()) {
            page._prevUsers = page.users.size;
            page._prevSessions = page.sessions.size;
            page.views = 0;
            page.entrances = 0;
            page.exits = 0;
            page.duration = 0;
            page.bounces = 0;
        }
        for (const user of userAnalyticsBuffer.values()) {
            user._prevSessions = user.sessions.size;
        }
        for (const ref of referrerAnalyticsBuffer.values()) {
            ref._prevUsers = ref.users.size;
            ref._prevSessions = ref.sessions.size;
            ref.views = 0;
        }
        for (const dev of deviceAnalyticsBuffer.values()) {
            dev._prevUsers = dev.users.size;
            dev._prevSessions = dev.sessions.size;
        }
        for (const geo of countryAnalyticsBuffer.values()) {
            geo._prevUsers = geo.users.size;
            geo._prevSessions = geo.sessions.size;
        }
        for (const camp of campaignAnalyticsBuffer.values()) {
            camp._prevUsers = camp.users.size;
            camp._prevSessions = camp.sessions.size;
            camp.views = 0;
        }
        for (const site of siteMetricsBuffer.values()) {
            site._prevVisitors = site.visitors.size;
            site._prevSessions = site.sessions.size;
            site.views = 0;
            site.bounces = 0;
            site.totalDuration = 0;
        }

        // Purge stale entries from previous days
        const today = new Date().toISOString().split('T')[0];
        const purgeStale = (map: Map<string, { timestamp: Date }>) => {
            for (const [k, v] of map) {
                if (v.timestamp.toISOString().split('T')[0] !== today) map.delete(k);
            }
        };
        [eventAggregateBuffer, pageAnalyticsBuffer, userAnalyticsBuffer,
         referrerAnalyticsBuffer, deviceAnalyticsBuffer, countryAnalyticsBuffer,
         campaignAnalyticsBuffer, siteMetricsBuffer].forEach(m =>
            purgeStale(m as unknown as Map<string, { timestamp: Date }>)
        );

        bufferCount = 0;

        console.log("Analytics buffers flushed successfully");
    } catch (error) {
        console.error("Failed to flush analytics buffers:", error);
    } finally {
        isFlushing = false;
    }
}

function addToBuffer(eventData: AnalyticsEvent, geoData: { country?: string; region?: string; city?: string } | null, bounceDelta: number = 0) {
    const eventDate = new Date(eventData.timestamp ?? Date.now());
    const hourStart = new Date(eventDate.toISOString().split('T')[0] || '');

    if (isNaN(hourStart.getTime())) {
        throw new Error('Invalid date');
    }

    const hourStr = hourStart.toISOString();

    // 1. Session buffer
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

    // 2. Event Aggregate buffer
    const eventAggKey = `${eventData.projectId}:${hourStr}:${eventData.event}`;
    const existingEventAgg = eventAggregateBuffer.get(eventAggKey);
    if (existingEventAgg) {
        existingEventAgg.count++;
        existingEventAgg.users.add(eventData.anonymousId);
        existingEventAgg.sessions.add(eventData.sessionId);
    } else {
        eventAggregateBuffer.set(eventAggKey, {
            projectId: eventData.projectId,
            timestamp: hourStart,
            eventName: eventData.event,
            count: 1,
            users: new Set([eventData.anonymousId]),
            sessions: new Set([eventData.sessionId]),
            _prevUsers: 0,
            _prevSessions: 0,
        });
    }

    // 3. User Analytics buffer
    const userKey = `${eventData.projectId}:${hourStr}:${eventData.anonymousId}`;
    const existingUser = userAnalyticsBuffer.get(userKey);
    if (existingUser) {
        existingUser.sessions.add(eventData.sessionId);
    } else {
        userAnalyticsBuffer.set(userKey, {
            projectId: eventData.projectId,
            timestamp: hourStart,
            anonymousId: eventData.anonymousId,
            sessions: new Set([eventData.sessionId]),
            _prevSessions: 0,
        });
    }

    const isPageView = eventData.event === 'pageview' || eventData.event === 'page' || eventData.event === 'Page View';
    const isPageExit = eventData.event === 'Page Exit';

    // 4. Page Analytics buffer
    const pagePath = eventData.context?.path;
    if (pagePath) {
        const pageKey = `${eventData.projectId}:${hourStr}:${pagePath}`;
        const existingPage = pageAnalyticsBuffer.get(pageKey);

        const isEntrance = isPageView && !eventData.context?.previousPath; // basic logic for entrance
        const durationToAdd = isPageExit && typeof eventData.properties?.timeOnPage === 'number' ? eventData.properties.timeOnPage / 1000 : 0;
        const pageBounceToAdd = isPageExit && eventData.properties?.bounce ? 1 : 0;

        if (existingPage) {
            if (isPageView) existingPage.views++;
            if (isEntrance) existingPage.entrances++;
            if (isPageExit) existingPage.exits++;
            existingPage.duration += durationToAdd;
            existingPage.bounces += pageBounceToAdd;
            existingPage.users.add(eventData.anonymousId);
            existingPage.sessions.add(eventData.sessionId);
        } else {
            pageAnalyticsBuffer.set(pageKey, {
                projectId: eventData.projectId,
                timestamp: hourStart,
                pagePath: pagePath,
                views: isPageView ? 1 : 0,
                entrances: isEntrance ? 1 : 0,
                exits: isPageExit ? 1 : 0,
                duration: durationToAdd,
                bounces: pageBounceToAdd,
                users: new Set([eventData.anonymousId]),
                sessions: new Set([eventData.sessionId]),
                _prevUsers: 0,
                _prevSessions: 0,
            });
        }
    }

    // 5. Referrer Analytics buffer
    const referrerStr = eventData.context?.referrer;
    if (referrerStr && isPageView) {
        let domain = 'Direct';
        try {
            domain = new URL(referrerStr).hostname;
        } catch {
            domain = referrerStr;
        }
        const refKey = `${eventData.projectId}:${hourStr}:${domain}`;
        const existingRef = referrerAnalyticsBuffer.get(refKey);
        if (existingRef) {
            existingRef.views++;
            existingRef.users.add(eventData.anonymousId);
            existingRef.sessions.add(eventData.sessionId);
        } else {
            referrerAnalyticsBuffer.set(refKey, {
                projectId: eventData.projectId,
                timestamp: hourStart,
                referrer: domain,
                views: 1,
                users: new Set([eventData.anonymousId]),
                sessions: new Set([eventData.sessionId]),
                _prevUsers: 0,
                _prevSessions: 0,
            });
        }
    }

    // 6. Device Analytics
    const uaStr = eventData.context?.userAgent;
    if (uaStr) {
        const parser = new UAParser(uaStr);
        const browser = parser.getBrowser().name || 'Unknown';
        const os = parser.getOS().name || 'Unknown';
        let deviceType = parser.getDevice().type || 'Desktop';
        // Normalize 'mobile' | 'tablet' -> 'Phone' | 'Tablet'
        if (deviceType === 'mobile') deviceType = 'Phone';
        if (deviceType === 'tablet') deviceType = 'Tablet';
        if (!['Desktop', 'Phone', 'Tablet'].includes(deviceType)) deviceType = 'Desktop';

        const devKey = `${eventData.projectId}:${hourStr}:${deviceType}:${browser}:${os}`;
        const existingDev = deviceAnalyticsBuffer.get(devKey);
        if (existingDev) {
            existingDev.users.add(eventData.anonymousId);
            existingDev.sessions.add(eventData.sessionId);
        } else {
            deviceAnalyticsBuffer.set(devKey, {
                projectId: eventData.projectId,
                timestamp: hourStart,
                deviceType,
                browser,
                os,
                users: new Set([eventData.anonymousId]),
                sessions: new Set([eventData.sessionId]),
                _prevUsers: 0,
                _prevSessions: 0,
            });
        }
    }

    // 7. Country Analytics
    if (geoData) {
        const country = geoData.country || 'Unknown';
        const region = geoData.region || 'Unknown';
        const city = geoData.city || 'Unknown';

        const geoKey = `${eventData.projectId}:${hourStr}:${country}:${region}:${city}`;
        const existingGeo = countryAnalyticsBuffer.get(geoKey);
        if (existingGeo) {
            existingGeo.users.add(eventData.anonymousId);
            existingGeo.sessions.add(eventData.sessionId);
        } else {
            countryAnalyticsBuffer.set(geoKey, {
                projectId: eventData.projectId,
                timestamp: hourStart,
                country,
                region,
                city,
                users: new Set([eventData.anonymousId]),
                sessions: new Set([eventData.sessionId]),
                _prevUsers: 0,
                _prevSessions: 0,
            });
        }
    }

    // 8. Campaign Analytics
    const urlStr = eventData.context?.url;
    if (urlStr) {
        const utm = parseUtm(urlStr);
        if (utm.utmSource !== 'Direct' || utm.utmMedium !== 'None' || utm.utmCampaign !== 'None') {
            const campKey = `${eventData.projectId}:${hourStr}:${utm.utmSource}:${utm.utmMedium}:${utm.utmCampaign}:${utm.utmTerm}:${utm.utmContent}`;
            const existingCamp = campaignAnalyticsBuffer.get(campKey);
            if (existingCamp) {
                if (isPageView) existingCamp.views++;
                existingCamp.users.add(eventData.anonymousId);
                existingCamp.sessions.add(eventData.sessionId);
            } else {
                campaignAnalyticsBuffer.set(campKey, {
                    projectId: eventData.projectId,
                    timestamp: hourStart,
                    ...utm,
                    views: isPageView ? 1 : 0,
                    users: new Set([eventData.anonymousId]),
                    sessions: new Set([eventData.sessionId]),
                    _prevUsers: 0,
                    _prevSessions: 0,
                });
            }
        }
    }

    // 9. Site Metrics
    const siteKey = `${eventData.projectId}:${hourStr}`;
    const existingSite = siteMetricsBuffer.get(siteKey);
    const siteDurationToAdd = isPageExit && typeof eventData.properties?.timeOnPage === 'number' ? eventData.properties.timeOnPage / 1000 : 0;

    if (existingSite) {
        existingSite.visitors.add(eventData.anonymousId);
        existingSite.sessions.add(eventData.sessionId);
        if (isPageView) existingSite.views++;
        existingSite.bounces += bounceDelta;
        existingSite.totalDuration += siteDurationToAdd;
    } else {
        siteMetricsBuffer.set(siteKey, {
            projectId: eventData.projectId,
            timestamp: hourStart,
            visitors: new Set([eventData.anonymousId]),
            views: isPageView ? 1 : 0,
            sessions: new Set([eventData.sessionId]),
            bounces: bounceDelta,
            totalDuration: siteDurationToAdd,
            _prevVisitors: 0,
            _prevSessions: 0,
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
                const { eventData, geoData, bounceDelta } = job.data as {
                    eventData: AnalyticsEvent;
                    geoData: { country?: string; region?: string; city?: string } | null;
                    bounceDelta?: number;
                };

                addToBuffer(eventData, geoData, bounceDelta || 0);

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