import pino from "pino";
import { env } from "./env";

const baseConfig = {
  level: env.NODE_ENV === "production" ? "info" : "debug",
};

export const logger = pino(
  env.NODE_ENV === "development"
    ? {
        ...baseConfig,
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss.l" },
        },
      }
    : baseConfig,
);
