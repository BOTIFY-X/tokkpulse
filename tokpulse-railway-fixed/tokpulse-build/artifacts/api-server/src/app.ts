import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) { return { id: req.id, method: req.method, url: req.url?.split("?")[0] }; },
      res(res) { return { statusCode: res.statusCode }; },
    },
  }),
);

// ── Clerk proxy (must be BEFORE express.json) ─────────────────────────────────
app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// ── Healthcheck (always 200, no auth, no DB) ──────────────────────────────────
app.get("/api/healthz", (_req, res) => { res.json({ status: "ok" }); });

app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Static file serving BEFORE Clerk middleware ───────────────────────────────
// This is critical: serving index.html must NOT go through clerkMiddleware,
// which validates CLERK_SECRET_KEY and throws if it's missing/invalid.
const __dirnameProd = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirnameProd, "public");

if (fs.existsSync(staticDir)) {
  // Serve all static assets (JS, CSS, images) directly — no auth needed
  app.use(express.static(staticDir, { index: false }));

  const indexHtmlPath = path.join(staticDir, "index.html");
  const indexHtmlTemplate = fs.existsSync(indexHtmlPath)
    ? fs.readFileSync(indexHtmlPath, "utf-8")
    : null;

  // SPA fallback — inject Clerk key at runtime so it never gets baked into the image
  app.get("/*splat", (req, res, next) => {
    // Let /api/* routes fall through to the API router below
    if (req.path.startsWith("/api/")) { next(); return; }

    if (!indexHtmlTemplate) { res.status(404).send("index.html not found"); return; }

    const protocol = (req.headers["x-forwarded-proto"] as string) ?? req.protocol ?? "https";
    const host = getClerkProxyHost(req) ?? req.hostname;
    const proxyUrl = `${protocol}://${host}${CLERK_PROXY_PATH}`;
    const clerkKey = process.env.CLERK_PUBLISHABLE_KEY ?? "";

    const html = indexHtmlTemplate
      .replace(/%%CLERK_PUBLISHABLE_KEY%%/g, clerkKey)
      .replace(/%%CLERK_PROXY_URL%%/g, proxyUrl);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.send(html);
  });
}

// ── Clerk middleware scoped to /api/* only ────────────────────────────────────
// This keeps page loads working even if CLERK_SECRET_KEY has issues.
app.use(
  "/api",
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

export default app;
