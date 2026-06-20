# ═══════════════════════════════════════════════════════════════════════
#  TokPulse — Railway-ready Dockerfile
#
#  Required Railway Variables (set in Railway dashboard, NOT here):
#    CLERK_PUBLISHABLE_KEY   — your Clerk publishable key (pk_live_...)
#    CLERK_SECRET_KEY        — your Clerk secret key (sk_live_...)
#    DATABASE_URL            — auto-injected by Railway PostgreSQL plugin
#    OPENAI_API_KEY          — add in Railway → Variables dashboard
#    SESSION_SECRET          — a long random string for session signing
#
#  Do NOT bake real secrets into ENV lines below. Railway injects them at
#  runtime. The ENV lines here are only for build-time Vite/Node defaults.
# ═══════════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ────────────────────────────────────────────────────
FROM node:24-slim AS builder
WORKDIR /app

# BASE_PATH and PORT are needed by vite.config.ts at build time.
# CLERK_PUBLISHABLE_KEY is intentionally NOT baked here — it is injected
# at request time by Express via window.__ENV__ template substitution.
ENV BASE_PATH=/
ENV PORT=8080
ENV NODE_ENV=production

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.base.json ./
COPY lib/ ./lib/
COPY artifacts/api-server/ ./artifacts/api-server/
COPY artifacts/tokpulse/ ./artifacts/tokpulse/
COPY scripts/ ./scripts/

RUN pnpm install --frozen-lockfile --ignore-scripts
RUN pnpm run typecheck:libs
RUN pnpm --filter @workspace/tokpulse run build
RUN pnpm --filter @workspace/api-server run build

# ── Stage 2: Production runtime ─────────────────────────────────────────
FROM node:24-slim AS production
WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/tokpulse/dist/public ./dist/public

RUN mkdir -p /app/uploads

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080
# All other secrets (CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, DATABASE_URL,
# SESSION_SECRET, OPENAI_API_KEY) must be set in Railway → Variables.
# CLERK_PUBLISHABLE_KEY is injected into index.html at request time — not baked.

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "/app/dist/index.mjs"]
