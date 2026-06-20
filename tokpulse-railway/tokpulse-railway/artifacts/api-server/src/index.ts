import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, () => {
  logger.info({ port }, "Server listening");
});

// Express 5: listen() does not pass an error to the callback.
// Startup errors (e.g. EADDRINUSE) are emitted on the server instance.
server.on("error", (err: Error) => {
  logger.error({ err }, "Error listening on port");
  process.exit(1);
});
