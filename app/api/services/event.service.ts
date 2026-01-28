import { Queue } from 'bullmq';
import type { AnalyticsEvent } from "@glimpse/shared/event.schema";
const redisPort = process.env.REDIS_PORT
  ? Number(process.env.REDIS_PORT)
  : 6379;


export const eventQueue = new Queue('eventQueue', {
  connection: {
    host: process.env.REDIS_HOST ?? "redis",
    port: redisPort,
  }
})

export async function addEventToQueue(event: AnalyticsEvent) {
  await eventQueue.add("ingest-event", event);
}