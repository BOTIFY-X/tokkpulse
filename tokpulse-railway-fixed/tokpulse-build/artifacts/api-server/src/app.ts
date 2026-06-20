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

// ── Static file serving ────────────────────────────────────────────────────────
// Serve pre-built Vite SPA from dist/public when it exists (production Docker).
const __dirnameProd = path.dirname(fileURLToPath(import.meta.url));
const staticDir = path.join(__dirnameProd, "public");

if (fs.existsSync(staticDir)) {
  // Read template once at startup
  const indexHtmlPath = path.join(staticDir, "index.html");
  let indexHtmlTemplate = fs.existsSync(indexHtmlPath)
    ? fs.readFileSync(indexHtmlPath, "utf-8")
    : null;

  app.use(express.static(staticDir, { index: false }));

  // SPA fallback with runtime Clerk key injection
  app.get("/*splat", (req, res) => {
    if (!indexHtmlTemplate) {
      res.status(404).send("index.html not found");
      return;
    }

    const protocol = req.headers["x-forwarded-proto"] ?? req.protocol ?? "https";
    const host = getClerkProxyHost(req) ?? req.hostname;
    const proxyUrl = `${protocol}://${host}${CLERK_PROXY_PATH}`;

    const clerkKey = process.env.CLERK_PUBLISHABLE_KEY ?? "";

    const html = indexHtmlTemplate
      .replace(/%%CLERK_PUBLISHABLE_KEY%%/g, clerkKey)
      .replace(/%%CLERK_PROXY_URL%%/g, proxyUrl);

    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.send(html);
  });
}

export default app;
