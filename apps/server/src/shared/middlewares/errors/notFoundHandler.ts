import type { RequestHandler } from "express";
import { fail } from "../../http/response";

export const notFoundHandler: RequestHandler = (req, res) => {
  fail(res, 404, `Route ${req.method} ${req.originalUrl} not found`, {
    code: "ROUTE_NOT_FOUND",
  });
};
