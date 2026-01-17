FROM oven/bun:latest

WORKDIR /repo

COPY . .
RUN bun install


CMD [ "bun" , "run", "index.ts" ]