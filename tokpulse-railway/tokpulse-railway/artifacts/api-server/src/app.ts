import path from "path";
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
// Railway and Replit both hit /api/healthz — must be reachable even if Clerk
// secret key or DB is not configured yet (prevents deploy-blocking 500s).
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

// ── Production static file serving (Railway / deployed builds) ────────────────
// On Replit, NODE_ENV=development and the Vite dev server handles the frontend.
// In a deployed container (NODE_ENV=production), Express serves the pre-built
// Vite SPA that was copied into dist/public during the Docker build.
if (process.env.NODE_ENV === "production") {
  const __dirnameProd = path.dirname(fileURLToPath(import.meta.url));
  const staticDir = path.join(__dirnameProd, "public");

  app.use(express.static(staticDir));

  // SPA fallback — send index.html for all unmatched routes so client-side
  // routing (wouter) works correctly on direct URL access / refresh.
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticDir, "index.html"));
  });
}

export default app;
