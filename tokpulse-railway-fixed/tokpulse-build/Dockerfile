# ═══════════════════════════════════════════════════════════════════════════════
# TokPulse — Railway Dockerfile
#
# Set these in Railway → Variables dashboard (NOT here):
#   DATABASE_URL           auto-injected by Railway PostgreSQL plugin
#   CLERK_PUBLISHABLE_KEY  your pk_live_... key
#   CLERK_SECRET_KEY       your sk_live_... key
#   SESSION_SECRET         any long random string (used for admin JWT signing)
#   OPENAI_API_KEY         optional — enables the AI assistant
#   ADMIN_EMAIL            admin portal login (default: katsonofficial001@gmail.com)
#   ADMIN_PASSWORD         admin portal password
# ═══════════════════════════════════════════════════════════════════════════════

# ── Stage 1: Builder ─────────────────────────────────────────────────────────
FROM node:24-slim AS builder
WORKDIR /app

# A non-empty placeholder satisfies Vite's env check at build time.
# The REAL key is injected by Express at REQUEST time via index.html template
# substitution — it is never baked into the built JS bundle.
ENV VITE_CLERK_PUBLISHABLE_KEY=pk_build_placeholder
ENV CLERK_PUBLISHABLE_KEY=pk_build_placeholder
ENV CLERK_SECRET_KEY=sk_build_placeholder
ENV SESSION_SECRET=build_placeholder_secret
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
# All secrets come from Railway Variables at runtime — nothing sensitive here

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/api/healthz || exit 1

CMD ["node", "--enable-source-maps", "/app/dist/index.mjs"]
