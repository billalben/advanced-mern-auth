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
