import { createServer } from "node:http";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/database";
import { createPingJob } from "./config/cron";
import { logger } from "./config/logger";
import { createApp } from "./app";

const main = async (): Promise<void> => {
  try {
    await connectDB(env.MONGODB_URI);

    const pingJob = env.PING_URL ? createPingJob(env.PING_URL) : null;
    pingJob?.start();
    if (pingJob) logger.info("Cron job started");

    const app = createApp();
    const server = createServer(app);

    server.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, "Shutdown signal received");
      pingJob?.stop();
      server.close();
      await disconnectDB();
      process.exit(0);
    };

    process.on("SIGTERM", () => void shutdown("SIGTERM"));
    process.on("SIGINT", () => void shutdown("SIGINT"));
  } catch (error) {
    logger.error({ err: error }, "Fatal startup error");
    process.exit(1);
  }
};

void main();
