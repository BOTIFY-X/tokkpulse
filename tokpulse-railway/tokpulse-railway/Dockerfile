# ═══════════════════════════════════════════════════════════════════
  # TokPulse — Railway-ready Dockerfile
  # All env vars are baked in EXCEPT:
  #   DATABASE_URL  → Connect Railway PostgreSQL plugin (auto-injected)
  #   OPENAI_API_KEY → Add in Railway Variables dashboard
  # ═══════════════════════════════════════════════════════════════════

  # ── Stage 1: Builder ────────────────────────────────────────────────
  FROM node:24-alpine AS builder
  WORKDIR /app

  ENV VITE_CLERK_PUBLISHABLE_KEY=true
  ENV CLERK_PUBLISHABLE_KEY=true
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

  RUN pnpm install --frozen-lockfile
  RUN pnpm run typecheck:libs
  RUN pnpm --filter @workspace/tokpulse run build
  RUN pnpm --filter @workspace/api-server run build

  # ── Stage 2: Production runtime ─────────────────────────────────────
  FROM node:24-alpine AS production
  WORKDIR /app

  COPY --from=builder /app/artifacts/api-server/dist ./dist
  COPY --from=builder /app/artifacts/tokpulse/dist/public ./dist/public

  RUN mkdir -p /app/uploads

  EXPOSE 8080

  # ── Baked-in environment variables ───────────────────────────────────
  ENV NODE_ENV=production
  ENV PORT=8080
  ENV CLERK_SECRET_KEY=true
  ENV CLERK_PUBLISHABLE_KEY=true
  ENV SESSION_SECRET=true
  # DATABASE_URL is injected automatically by Railway PostgreSQL plugin
  # Add OPENAI_API_KEY in Railway → Variables dashboard

  HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -qO- http://localhost:8080/api/healthz || exit 1

  CMD ["node", "--enable-source-maps", "/app/dist/index.mjs"]
  