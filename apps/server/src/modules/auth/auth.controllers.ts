import type { Request, Response } from "express";
import * as service from "./auth.services";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
  VerifyEmailInput,
} from "./auth.schemas";
import { ok, created, fail } from "../../shared/http/response";
import { getValidated } from "../../shared/middlewares/validate";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { body } = getValidated<{ body: SignupInput }>(req);
  const result = await service.signup(body);
  created(res, result, "User created successfully");
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = getValidated<{ body: VerifyEmailInput }>(req);
  const { user } = await service.verifyEmail(body.code);
  ok(res, user, "Email verified successfully");
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { body } = getValidated<{ body: LoginInput }>(req);
  const { user } = await service.login(res, body);
  ok(res, user, "Logged in successfully");
};

export const logout = (_req: Request, res: Response): void => {
  service.logout(res);
  ok(res, null, "Logged out successfully");
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = getValidated<{ body: ForgotPasswordInput }>(req);
  await service.forgotPassword(body.email);
  ok(res, null, "Password reset link sent to your email");
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { params, body } = getValidated<ResetPasswordInput>(req);
  await service.resetPassword(params.token, body.password);
  ok(res, null, "Password reset successful");
};

export const checkAuth = async (req: Request, res: Response): Promise<void> => {
  if (!req.userId) {
    fail(res, 401, "Unauthorized");
    return;
  }
  const { user } = await service.checkAuth(req.userId);
  ok(res, user);
};
