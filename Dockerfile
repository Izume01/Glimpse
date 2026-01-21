FROM oven/bun:1.3.6

WORKDIR /repo

COPY package.json ./
COPY bun.lock ./ 

RUN bun install

CMD ["bun", "--watch", "--poll", "run", "index.ts"]
