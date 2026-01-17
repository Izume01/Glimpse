// index.ts
console.log("API starting...");

import http from "http";

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("ok");
});

server.listen(3000, () => {
  console.log("API listening on http://localhost:3000");
});
