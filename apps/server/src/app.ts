import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoSanitize from "@exortek/express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import { pinoHttp } from "pino-http";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./shared/middlewares/errorHandler";

export const createApp = (): Express => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "10kb" }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  app.use(pinoHttp({ logger }));

  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  });

  app.get("/", (_req, res) => {
    res.json({ success: true, message: "welcome to the api" });
  });

  app.use("/api/", apiLimiter);

  app.use("/api/auth", authRouter);

  app.use(errorHandler);

  return app;
};
