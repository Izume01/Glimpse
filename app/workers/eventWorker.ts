import { Worker } from "bullmq";
import { uuid } from "zod";

const redisPort = process.env.REDIS_PORT
    ? Number(process.env.REDIS_PORT)
    : 6379;

const eventWorker = new Worker(
    "eventQueue",
    async job => {
        switch(job.name) {
            case "ingest-event":
                const eventData = job.data;

                if (!eventData.sessionId) {
                    eventData.sessionId = uuid();
                }
                
                console.log(`EVENT NAME : ${eventData.event}`);
                console.log(`EVENT NAME : ${eventData.sessionId}`);

                // We will be doing  the Database part here 
                // TODO: store in DB, analytics pipeline, etc

                // --------------------------------------------
                
                // Now here we will be doing Extract IP , Geolookup and then storing it in the redis with a set ttl
                
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