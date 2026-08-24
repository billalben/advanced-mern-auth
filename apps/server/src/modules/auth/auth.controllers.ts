import type { Request, Response } from "express";
import * as service from "./auth.services";
import type {
  ForgotPasswordInput,
  LoginInput,
  ResetPasswordInput,
  SignupInput,
  VerifyEmailInput,
} from "./auth.schemas";

const getValidated = (
  req: Request,
): NonNullable<typeof req.validated> => {
  const v = req.validated;
  if (!v) {
    throw new Error("Validator middleware not applied");
  }
  return v;
};

export const signup = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = getValidated(req) as { body: SignupInput };
  const created = await service.signup(body);
  res.status(201).json({
    success: true,
    message: "User created successfully",
    user: created,
  });
};

export const verifyEmail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = getValidated(req) as { body: VerifyEmailInput };
  const { user } = await service.verifyEmail(body.code);
  res.status(200).json({
    success: true,
    message: "Email verified successfully",
    user,
  });
};

export const login = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = getValidated(req) as { body: LoginInput };
  const { user } = await service.login(res, body);
  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    user,
  });
};

export const logout = (_req: Request, res: Response): void => {
  service.logout(res);
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { body } = getValidated(req) as { body: ForgotPasswordInput };
  await service.forgotPassword(body.email);
  res.status(200).json({
    success: true,
    message: "Password reset link sent to your email",
  });
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { params, body } = getValidated(req) as ResetPasswordInput;
  await service.resetPassword(params.token, body.password);
  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
};

export const checkAuth = async (
  req: Request,
  res: Response,
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
    return;
  }
  const { user } = await service.checkAuth(req.userId);
  res.status(200).json({
    success: true,
    user,
  });
};
