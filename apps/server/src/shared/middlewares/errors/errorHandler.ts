import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../../errors/AppError";
import { logger } from "../../../config/logger";
import { fail } from "../../http/response";
import { formatZodError } from "../../http/zodFormatter";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return fail(res, 400, "Validation failed", {
      code: "VALIDATION_ERROR",
      data: { fields: formatZodError(err) },
    });
  }

  if (err instanceof AppError) {
    return fail(
      res,
      err.statusCode,
      err.message,
      err.code !== undefined ? { code: err.code } : {},
    );
  }

  logger.error({ err }, "Unhandled error");
  return fail(res, 500, "Internal server error");
};
