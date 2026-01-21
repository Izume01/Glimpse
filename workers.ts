import eventWorker from "./app/workers/eventWorker";

console.log("Event workers started");

process.on("SIGINT", async () => {
    console.log("Shutting down worker...");
    await eventWorker.close();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("Shutting down worker...");
    await eventWorker.close();
    process.exit(0);
});
