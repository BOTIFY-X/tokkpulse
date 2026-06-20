import path from "path";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import express, { type Express, type Request, type Response } from "express";
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
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

// ── Healthcheck BEFORE Clerk middleware so it always returns 200 ───────────────
// Railway hits /api/healthz — must be reachable even if Clerk secret key or
// DB is not configured yet (prevents deploy-blocking 500s).
app.get("/api/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.use(cors({ credentials: true, origin: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use("/api", router);

// ── Static file serving for the built Vite SPA ────────────────────────────────
// We check whether dist/public actually exists on disk rather than relying on
// NODE_ENV — Railway may override NODE_ENV independently of the Docker build.
// In local dev the directory won't exist, so this block is safely skipped.
const __dirnameCurrent = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirnameCurrent, "public");

if (existsSync(staticDir)) {
  const indexHtmlPath = path.join(staticDir, "index.html");
  // Cache the template once at startup — placeholders replaced per-request.
  const indexHtmlTemplate = readFileSync(indexHtmlPath, "utf-8");

  logger.info({ staticDir }, "Serving static SPA from dist/public");

  // Serve JS/CSS/images directly — skip index.html (handled below).
  app.use(express.static(staticDir, { index: false }));

  // For every navigation request, inject runtime env vars and serve the SPA.
  app.get("/*splat", (req: Request, res: Response) => {
    const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY ?? "";

    // Compute Clerk proxy URL from the live request host so it always matches
    // the domain Railway assigned — this cannot be known at Docker build time.
    const protocol = (
      Array.isArray(req.headers["x-forwarded-proto"])
        ? req.headers["x-forwarded-proto"][0]
        : req.headers["x-forwarded-proto"]
    ) ?? "https";
    const rawHost = (
      Array.isArray(req.headers["x-forwarded-host"])
        ? req.headers["x-forwarded-host"][0]
        : req.headers["x-forwarded-host"]
    ) ?? req.headers.host ?? "";
    const host = rawHost.toString().split(",")[0].trim();
    const clerkProxyUrl = `${protocol}://${host}${CLERK_PROXY_PATH}`;

    const html = indexHtmlTemplate
      .replace("%%CLERK_PUBLISHABLE_KEY%%", clerkPublishableKey)
      .replace("%%CLERK_PROXY_URL%%", clerkProxyUrl);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(html);
  });
}

export default app;
