FROM oven/bun

WORKDIR /repo

ARG GEOLITE_LICENSE_KEY
# Dummy URL for prisma generate (doesn't connect, just needs provider info)
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app

COPY package.json ./
COPY bun.lock ./
COPY prisma.config.ts ./
COPY packages/db/prisma ./packages/db/prisma

RUN bun install && \
    if [ -n "$GEOLITE_LICENSE_KEY" ]; then \
      cd node_modules/geoip-lite && \
      bun run updatedb -- license_key=$GEOLITE_LICENSE_KEY ; \
    else \
      echo "No GeoLite key provided, skipping update"; \
    fi

RUN bunx prisma generate
CMD ["bun", "--watch", "--poll", "run", "index.ts"]