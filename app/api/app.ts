import { Hono } from "hono";
import eventRouter from "./routes/event.route";

const app = new Hono();

app.get("/check" , (c) => {
    return c.json({ status: "ok" });
})

app.route("/event", eventRouter);

export default app;