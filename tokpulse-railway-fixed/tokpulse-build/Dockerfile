# ═══════════════════════════════════════════════════════════════════════════════
# TokPulse — Railway-ready Dockerfile
#
# Required Railway Variables (set in Railway → Variables dashboard):
#   DATABASE_URL           → connect Railway PostgreSQL plugin (auto-injected)
#   CLERK_PUBLISHABLE_KEY  → your Clerk publishable key (pk_live_...)
#   CLERK_SECRET_KEY       → your Clerk secret key (sk_live_...)
#   SESSION_SECRET         → any long random string for JWT signing
#   OPENAI_API_KEY         → optional, for AI assistant
#   ADMIN_EMAIL            → admin login email (default: katsonofficial001@gmail.com)
#   ADMIN_PASSWORD         → admin login password
# ═══════════════════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:24-slim AS builder
WORKDIR /app

# Vite needs SOME value for VITE_CLERK_PUBLISHABLE_KEY at build time.
# The real key is injected at RUNTIME via Express template replacement in index.html.
ENV VITE_CLERK_PUBLISHABLE_KEY=pk_build_placeholder
ENV CLERK_PUBLISHABLE_KEY=pk_build_placeholder
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

# ── Stage 2: Production runtime ──────────────────────────────────────────────
FROM node:24-slim AS production
WORKDIR /app

COPY --from=builder /app/artifacts/api-server/dist ./dist
COPY --from=builder /app/artifacts/tokpulse/dist/public ./dist/public

RUN mkdir -p /app/uploads

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080
# All secrets are injected by Railway at runtime — do NOT hard-code them here.
# Required: DATABASE_URL, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, SESSION_SECRET

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "/app/dist/index.mjs"]
