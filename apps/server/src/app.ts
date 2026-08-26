import express, { type Express } from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { helmetMiddleware } from "./shared/middlewares/security/helmet";
import { corsMiddleware } from "./shared/middlewares/security/cors";
import { mongoSanitizeMiddleware } from "./shared/middlewares/security/mongoSanitize";
import { apiLimiter } from "./shared/middlewares/security/rateLimiter";
import { jsonParser } from "./shared/middlewares/parsers/json";
import { cookieParserMiddleware } from "./shared/middlewares/parsers/cookie";
import { httpLogger } from "./shared/middlewares/logging/httpLogger";
import { notFoundHandler } from "./shared/middlewares/errors/notFoundHandler";
import { errorHandler } from "./shared/middlewares/errors/errorHandler";
import { ok } from "./shared/http/response";

export const createApp = (): Express => {
  const app = express();

  app.use(helmetMiddleware);
  app.use(corsMiddleware);
  app.use(mongoSanitizeMiddleware);
  app.use(jsonParser);
  app.use(cookieParserMiddleware);
  app.use(httpLogger);

  app.get("/", (_req, res) => {
    ok(res, null, "welcome to the api");
  });

  app.use("/api", apiLimiter, authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
