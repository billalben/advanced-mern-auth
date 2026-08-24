import type { Request } from "express";

export interface AuthedRequestBody {
  body?: unknown;
  params?: unknown;
  query?: unknown;
  userId?: string;
}

export type AuthedRequest = Request & {
  validated?: AuthedRequestBody;
};

export interface SignupSuccess {
  success: true;
  message: string;
  user: { name: string; email: string };
}

export interface VerifyEmailSuccess {
  success: true;
  message: string;
  user: Record<string, unknown>;
}

export interface LoginSuccess {
  success: true;
  message: string;
  user: Record<string, unknown>;
}

export interface GenericSuccess {
  success: true;
  message: string;
}

export interface CheckAuthSuccess {
  success: true;
  user: Record<string, unknown>;
}
