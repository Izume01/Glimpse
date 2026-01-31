/*
  Warnings:

  - You are about to drop the `event` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "event";

-- DropTable
DROP TABLE "user";

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" BIGSERIAL NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "anonymousId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "traits" JSONB,
    "properties" JSONB,
    "context" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "country" TEXT,
    "region" TEXT,
    "city" TEXT,
    "timezone" TEXT,
    "lat" DOUBLE PRECISION,
    "lon" DOUBLE PRECISION,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_sessions" (
    "projectId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "userId" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,
    "eventCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("projectId","sessionId")
);

-- CreateTable
CREATE TABLE "daily_event_aggregates" (
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "users" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "daily_event_aggregates_pkey" PRIMARY KEY ("projectId","date","eventName")
);

-- CreateTable
CREATE TABLE "daily_page_analytics" (
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pagePath" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,
    "bounces" INTEGER NOT NULL,

    CONSTRAINT "daily_page_analytics_pkey" PRIMARY KEY ("projectId","date","pagePath")
);

-- CreateTable
CREATE TABLE "daily_user_analytics" (
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL,
    "isNew" BOOLEAN NOT NULL,

    CONSTRAINT "daily_user_analytics_pkey" PRIMARY KEY ("projectId","date","anonymousId")
);

-- CreateTable
CREATE TABLE "AnalyticsCheckpoint" (
    "name" TEXT NOT NULL,
    "lastEventId" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnalyticsCheckpoint_pkey" PRIMARY KEY ("name")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "events_projectId_occurredAt_idx" ON "events"("projectId", "occurredAt");

-- CreateIndex
CREATE INDEX "events_projectId_sessionId_idx" ON "events"("projectId", "sessionId");

-- CreateIndex
CREATE INDEX "events_projectId_anonymousId_idx" ON "events"("projectId", "anonymousId");

-- CreateIndex
CREATE INDEX "events_projectId_userId_idx" ON "events"("projectId", "userId");

-- CreateIndex
CREATE INDEX "analytics_sessions_projectId_startedAt_idx" ON "analytics_sessions"("projectId", "startedAt");

-- CreateIndex
CREATE INDEX "analytics_sessions_projectId_anonymousId_idx" ON "analytics_sessions"("projectId", "anonymousId");
