/*
  Warnings:

  - You are about to drop the `daily_campaign_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_country_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_device_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_event_aggregates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_page_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_referrer_analytics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_site_metrics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_user_analytics` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "daily_campaign_analytics";

-- DropTable
DROP TABLE "daily_country_analytics";

-- DropTable
DROP TABLE "daily_device_analytics";

-- DropTable
DROP TABLE "daily_event_aggregates";

-- DropTable
DROP TABLE "daily_page_analytics";

-- DropTable
DROP TABLE "daily_referrer_analytics";

-- DropTable
DROP TABLE "daily_site_metrics";

-- DropTable
DROP TABLE "daily_user_analytics";

-- CreateTable
CREATE TABLE "hourly_event_aggregates" (
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "eventName" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "users" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "hourly_event_aggregates_pkey" PRIMARY KEY ("projectId","timestamp","eventName")
);

-- CreateTable
CREATE TABLE "hourly_page_analytics" (
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "pagePath" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,
    "bounces" INTEGER NOT NULL,
    "entrances" INTEGER NOT NULL DEFAULT 0,
    "exits" INTEGER NOT NULL DEFAULT 0,
    "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "hourly_page_analytics_pkey" PRIMARY KEY ("projectId","timestamp","pagePath")
);

-- CreateTable
CREATE TABLE "hourly_referrer_analytics" (
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "referrer" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "hourly_referrer_analytics_pkey" PRIMARY KEY ("projectId","timestamp","referrer")
);

-- CreateTable
CREATE TABLE "hourly_device_analytics" (
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "deviceType" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "hourly_device_analytics_pkey" PRIMARY KEY ("projectId","timestamp","deviceType","browser","os")
);

-- CreateTable
CREATE TABLE "hourly_country_analytics" (
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "hourly_country_analytics_pkey" PRIMARY KEY ("projectId","timestamp","country","region","city")
);

-- CreateTable
CREATE TABLE "hourly_campaign_analytics" (
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "utmSource" TEXT NOT NULL,
    "utmMedium" TEXT NOT NULL,
    "utmCampaign" TEXT NOT NULL,
    "utmTerm" TEXT NOT NULL,
    "utmContent" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "hourly_campaign_analytics_pkey" PRIMARY KEY ("projectId","timestamp","utmSource","utmMedium","utmCampaign","utmTerm","utmContent")
);

-- CreateTable
CREATE TABLE "hourly_site_metrics" (
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "visitors" INTEGER NOT NULL,
    "views" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,
    "bounces" INTEGER NOT NULL,
    "totalDuration" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "hourly_site_metrics_pkey" PRIMARY KEY ("projectId","timestamp")
);

-- CreateTable
CREATE TABLE "hourly_user_analytics" (
    "projectId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "anonymousId" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL,
    "isNew" BOOLEAN NOT NULL,

    CONSTRAINT "hourly_user_analytics_pkey" PRIMARY KEY ("projectId","timestamp","anonymousId")
);
