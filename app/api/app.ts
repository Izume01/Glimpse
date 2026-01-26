import { Hono } from "hono";
import { cors } from "hono/cors";
import eventRouter from "./routes/event.route";
import getIP from "../../packages/shared/lib/getIp";

const app = new Hono();

app.use("*", cors({
  origin: (origin) => origin || "*",
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "Accept"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400,
  credentials: false,
}));

app.get("/check", (c) => {
    return c.json({ status: "ok" });
})

app.route("/event", eventRouter);

app.get("/", (c) => {
  const ip = getIP(c);
  const headers = Object.fromEntries(c.req.raw.headers.entries());

  return c.json({
    ip,
    headers,
  });
});


export default app;