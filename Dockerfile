# base with pnpm enabled for build stages
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

# enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# install deps (cached)
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

# cache the store
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# build
FROM base AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN pnpm run build

# production-only deps
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile

# runtime image, no pnpm
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# runtime assets
COPY --from=builder /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules

# mount keys at runtime: -v $(pwd)/keys:/app/keys:ro
# COPY keys ./keys

USER node

EXPOSE 3111

CMD ["node", "dist/main.js"]

# TODO: healthcheck (may require curl/wget if installed)
# HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost:3111/api-json >/dev/null || exit 1