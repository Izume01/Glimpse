import app from "./app/api/app";
import "./instrument.ts"

Bun.serve({
  fetch: app.fetch,
  port: 3000,
})

console.log("Server is running on http://localhost:3000");