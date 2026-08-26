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

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: Date;
  lastLogin: Date;
}

export interface SignupSuccess {
  success: true;
  message: string;
  user: { name: string; email: string };
}

export interface VerifyEmailSuccess {
  success: true;
  message: string;
  user: PublicUser;
}

export interface LoginSuccess {
  success: true;
  message: string;
  user: PublicUser;
}

export interface GenericSuccess {
  success: true;
  message: string;
}

export interface CheckAuthSuccess {
  success: true;
  user: PublicUser;
}
