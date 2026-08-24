import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import type { Response } from "express";
import { env } from "../../config/env";
import { AppError } from "../../shared/errors/AppError";
import { User, type UserDoc } from "./models/user.model";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./mailtrap/emails";
import type {
  LoginInput,
  SignupInput,
} from "./auth.schemas";

const TOKEN_EXPIRATION = "1d";
const COOKIE_EXPIRATION_MS = 86_400_000; // 1 day
const VERIFICATION_TOKEN_TTL_MS = 3_600_000; // 1 hour
const RESET_TOKEN_TTL_MS = 1_800_000; // 30 minutes
const BCRYPT_ROUNDS = 10;

const signAuthToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: COOKIE_EXPIRATION_MS,
  });
};

const stripPassword = (
  user: UserDoc,
): Omit<UserDoc, "password"> & { password: undefined } => {
  return {
    ...user,
    password: undefined,
  } as unknown as Omit<UserDoc, "password"> & {
    password: undefined;
  };
};

export const signup = async (
  input: SignupInput,
): Promise<{ name: string; email: string }> => {
  const { name, email, password } = input;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError.badRequest("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const verificationToken = Math.floor(
    100_000 + Math.random() * 900_000,
  ).toString();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    verificationToken,
    verificationTokenExpiresAt: new Date(
      Date.now() + VERIFICATION_TOKEN_TTL_MS,
    ),
  });

  await sendVerificationEmail(user.email, verificationToken);

  return { name, email };
};

export const verifyEmail = async (
  code: string,
): Promise<{ user: Record<string, unknown> }> => {
  const user = await User.findOne({
    verificationToken: code,
    verificationTokenExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw AppError.badRequest(
      "Invalid or expired verification code",
    );
  }

  user.isVerified = true;
  user.verificationToken = undefined as unknown as string;
  user.verificationTokenExpiresAt = undefined as unknown as Date;
  await user.save();

  await sendWelcomeEmail(user.email, user.name);

  return { user: stripPassword(user) as unknown as Record<string, unknown> };
};

export const login = async (
  res: Response,
  input: LoginInput,
): Promise<{ user: Record<string, unknown> }> => {
  const { email, password } = input;

  const user = await User.findOne({ email });
  if (!user) {
    throw AppError.badRequest("Invalid credentials");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw AppError.badRequest("Invalid credentials");
  }

  const token = signAuthToken(user._id.toString());
  setAuthCookie(res, token);

  user.lastLogin = new Date();
  await user.save();

  return { user: stripPassword(user) as unknown as Record<string, unknown> };
};

export const logout = (res: Response): void => {
  res.clearCookie("token");
};

export const forgotPassword = async (email: string): Promise<void> => {
  const user = await User.findOne({ email });
  if (!user) {
    throw AppError.badRequest("User not found");
  }

  const resetToken = randomBytes(10).toString("hex");
  const resetTokenExpiresAt = new Date(
    Date.now() + RESET_TOKEN_TTL_MS,
  );

  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = resetTokenExpiresAt;
  await user.save();

  const resetURL = `${env.CLIENT_URL}/reset-password/${resetToken}`;
  await sendPasswordResetEmail(user.email, resetURL);
};

export const resetPassword = async (
  token: string,
  password: string,
): Promise<void> => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: new Date() },
  });

  if (!user) {
    throw AppError.badRequest("Invalid or expired reset token");
  }

  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
  user.password = hashedPassword;
  user.resetPasswordToken = undefined as unknown as string;
  user.resetPasswordExpiresAt = undefined as unknown as Date;
  await user.save();

  await sendResetSuccessEmail(user.email);
};

export const checkAuth = async (
  userId: string,
): Promise<{ user: Record<string, unknown> }> => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw AppError.badRequest("User not found");
  }
  return {
    user: user.toObject() as unknown as Record<string, unknown>,
  };
};
