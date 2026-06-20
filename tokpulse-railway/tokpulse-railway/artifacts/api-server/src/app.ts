import path from "path";
import { readFileSync } from "fs";
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

// ── Production static file serving (Railway deployed builds) ──────────────────
// Express serves the pre-built Vite SPA that was copied into dist/public during
// the Docker build. index.html is served specially so we can inject runtime env
// vars (CLERK_PUBLISHABLE_KEY, etc.) that are known only at container start time
// — NOT at Docker build time when Vite compiled the JS bundle.
if (process.env.NODE_ENV === "production") {
  const __dirnameProd = path.dirname(fileURLToPath(import.meta.url));
  const staticDir = path.join(__dirnameProd, "public");

  // Cache the template once at startup — placeholders get replaced per-request.
  const indexHtmlTemplate = readFileSync(path.join(staticDir, "index.html"), "utf-8");

  // Serve all static assets (JS/CSS/images) directly — skip index.html here.
  app.use(express.static(staticDir, { index: false }));

  // For every HTML navigation request, inject runtime env vars and serve the SPA.
  app.get("/*splat", (req: Request, res: Response) => {
    const clerkPublishableKey = process.env.CLERK_PUBLISHABLE_KEY ?? "";

    // Compute the Clerk proxy URL from the incoming request so it matches the
    // domain Railway actually assigned — this can't be known at build time.
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
