import { Worker, Queue } from "bullmq";
import { redis } from "@glimpse/db/redis";
import { prisma } from "@glimpse/db/client";

const redisPort = process.env.REDIS_PORT
    ? Number(process.env.REDIS_PORT)
    : 6379;

const redisConnection = {
    host: process.env.REDIS_HOST ?? "redis",
    port: redisPort,
};

const analyticsQueue = new Queue("analyticsQueue", {
    connection: redisConnection,
});

const analyticsWorker = new Worker(
    "analyticsQueue",
    async (job) => {
        console.log(`Processing analytics job: ${job.name}`, job.data);

        switch (job.name) {
            case "analytics-job":
                const { data } = job;
                // Process the analytics data                
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

// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("Shutting down analytics worker...");
    await analyticsWorker.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down analytics worker...");
    await analyticsWorker.close();
    process.exit(0);
});

export default analyticsWorker;
