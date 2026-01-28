-- CreateTable
CREATE TABLE "event" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" TEXT,
  "sessionId" TEXT,
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
  CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_projectId_occurredAt_idx" ON "event"("projectId", "occurredAt");

-- CreateIndex
CREATE INDEX "event_projectId_sessionId_idx" ON "event"("projectId", "sessionId");

