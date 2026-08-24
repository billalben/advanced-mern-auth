import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError";
import { env } from "../../config/env";

interface JwtPayload {
  userId: string;
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const token = req.cookies?.token;

  if (!token) {
    throw AppError.unauthorized("Unauthorized - no token provided");
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!decoded?.userId) {
      throw AppError.unauthorized("Unauthorized - invalid token");
    }
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw AppError.internal("Server error");
  }
};
