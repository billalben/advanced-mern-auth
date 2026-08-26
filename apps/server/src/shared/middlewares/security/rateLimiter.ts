import rateLimit, { type RateLimitRequestHandler } from "express-rate-limit";
import { fail } from "../../http/response";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 100;

export const apiLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    fail(res, 429, "Too many requests, please try again later.", {
      code: "RATE_LIMITED",
    });
  },
});
