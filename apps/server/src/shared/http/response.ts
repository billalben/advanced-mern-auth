import type { Response } from "express";

export interface SuccessEnvelope<T> {
  success: true;
  message?: string;
  data: T;
}

export interface FailureEnvelope {
  success: false;
  message: string;
  code?: string;
  data?: unknown;
}

export interface FailOptions {
  code?: string;
  data?: unknown;
}

export const ok = <T>(res: Response, data: T, message?: string): Response => {
  const body: SuccessEnvelope<T> = { success: true, data };
  if (message !== undefined) body.message = message;
  return res.status(200).json(body);
};

export const created = <T>(
  res: Response,
  data: T,
  message: string,
): Response => {
  return res.status(201).json({
    success: true,
    message,
    data,
  } satisfies SuccessEnvelope<T>);
};

export const noContent = (res: Response): Response => {
  return res.status(204).send();
};

export const fail = (
  res: Response,
  statusCode: number,
  message: string,
  options: FailOptions = {},
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(options.code !== undefined ? { code: options.code } : {}),
    ...(options.data !== undefined ? { data: options.data } : {}),
  } satisfies FailureEnvelope);
};
