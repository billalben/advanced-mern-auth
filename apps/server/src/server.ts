import { createServer } from "node:http";
import { env } from "./config/env";
import { connectDB, disconnectDB } from "./config/database";
import { logger } from "./config/logger";
import { createApp } from "./app";

const main = async (): Promise<void> => {
  try {
    await connectDB(env.MONGODB_URI);

    const app = createApp();
    const server = createServer(app);

    server.listen(env.PORT, () => {
      logger.info(`Server running on http://localhost:${env.PORT}`);
    });

    const shutdown = async (signal: string): Promise<void> => {
      logger.info({ signal }, "Shutdown signal received");
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
