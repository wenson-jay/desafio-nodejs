ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-slim AS base
ENV PNPM_HOME=/usr/local/pnpm \
    NODE_ENV=production \
    PORT=5555
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update \
    && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/* \
    && corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS runner
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src
COPY tsconfig.json ./tsconfig.json
COPY drizzle.config.ts ./drizzle.config.ts
COPY drizzle ./drizzle

EXPOSE ${PORT}

CMD ["sh", "-c", "until pg_isready -h \"${PGHOST:-db}\" -p \"${PGPORT:-5432}\" -d \"${PGDATABASE:-desafio}\" -U \"${PGUSER:-docker}\"; do echo 'Waiting for PostgreSQL...'; sleep 2; done; pnpm db:migrate && pnpm prune --prod && node --no-warnings --experimental-strip-types src/server.ts"]
