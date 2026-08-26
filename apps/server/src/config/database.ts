import mongoose from "mongoose";
import { logger } from "./logger";

export const connectDB = async (connectionURI: string): Promise<void> => {
  try {
    await mongoose.connect(connectionURI, {
      dbName: "authDB",
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
    });

    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error({ err: error }, "Error connecting to MongoDB");
    throw error;
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  } catch (error) {
    logger.error({ err: error }, "Error disconnecting from MongoDB");
    throw error;
  }
};
