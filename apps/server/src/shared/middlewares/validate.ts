import type { Request, Response, NextFunction } from "express";
import type { ZodTypeAny } from "zod";

type Source = "body" | "params" | "query";

export const validate =
  <T extends ZodTypeAny>(schema: T, source: Source = "body") =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      next(result.error);
      return;
    }

    const current = (req.validated ?? {}) as Record<string, unknown>;
    req.validated = { ...current, [source]: result.data };
    next();
  };

export const validateAll =
  <T extends ZodTypeAny>(schema: T) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      next(result.error);
      return;
    }

    req.validated = result.data as never;
    next();
  };

export const getValidated = <T>(req: Request): T => {
  const v = req.validated;
  if (!v) {
    throw new Error("Validator middleware not applied");
  }

  return v as T;
};
