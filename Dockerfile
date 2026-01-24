FROM oven/bun:1.3.6

WORKDIR /repo

ARG GEOLITE_LICENSE_KEY

COPY package.json ./
COPY bun.lock ./ 

RUN bun install && \
    if [ -n "$GEOLITE_LICENSE_KEY" ]; then \
      cd node_modules/geoip-lite && \
      bun run updatedb -- license_key=$GEOLITE_LICENSE_KEY ; \
    else \
      echo "No GeoLite key provided, skipping update"; \
    fi

CMD ["bun", "--watch", "--poll", "run", "index.ts"]
