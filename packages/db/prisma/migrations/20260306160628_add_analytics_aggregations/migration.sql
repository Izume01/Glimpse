-- AlterTable
ALTER TABLE "daily_page_analytics" ADD COLUMN     "duration" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "entrances" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "exits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "daily_referrer_analytics" (
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "referrer" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "daily_referrer_analytics_pkey" PRIMARY KEY ("projectId","date","referrer")
);

-- CreateTable
CREATE TABLE "daily_device_analytics" (
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "deviceType" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "os" TEXT NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "daily_device_analytics_pkey" PRIMARY KEY ("projectId","date","deviceType","browser","os")
);

-- CreateTable
CREATE TABLE "daily_country_analytics" (
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "daily_country_analytics_pkey" PRIMARY KEY ("projectId","date","country","region","city")
);

-- CreateTable
CREATE TABLE "daily_campaign_analytics" (
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "utmSource" TEXT NOT NULL,
    "utmMedium" TEXT NOT NULL,
    "utmCampaign" TEXT NOT NULL,
    "utmTerm" TEXT NOT NULL,
    "utmContent" TEXT NOT NULL,
    "views" INTEGER NOT NULL,
    "uniqueUsers" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,

    CONSTRAINT "daily_campaign_analytics_pkey" PRIMARY KEY ("projectId","date","utmSource","utmMedium","utmCampaign","utmTerm","utmContent")
);

-- CreateTable
CREATE TABLE "daily_site_metrics" (
    "projectId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "visitors" INTEGER NOT NULL,
    "views" INTEGER NOT NULL,
    "sessions" INTEGER NOT NULL,
    "bounces" INTEGER NOT NULL,
    "totalDuration" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "daily_site_metrics_pkey" PRIMARY KEY ("projectId","date")
);
