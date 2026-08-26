import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "node:crypto";
import type { Response } from "express";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { AppError } from "../../shared/errors/AppError";
import { User, type UserDoc } from "./models/user.model";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "./email/senders";
import type {
  LoginInput,
  SignupInput,
} from "./auth.schemas";
import type { PublicUser } from "./auth.types";

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

const toPublicUser = (user: UserDoc): PublicUser => {
  const doc = user as unknown as {
    toObject: () => Record<string, unknown>;
  };
  const obj = doc.toObject();
  const id = obj._id as { toString: () => string };
  const createdAt = obj.createdAt as Date;
  const lastLogin = obj.lastLogin as Date;
  return {
    id: id.toString(),
    email: obj.email as string,
    name: obj.name as string,
    isVerified: obj.isVerified as boolean,
    createdAt,
    lastLogin,
  };
};

export const signup = async (
  input: SignupInput,
): Promise<{ name: string; email: string }> => {
  const { name, email, password } = input;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw AppError.conflict("User already exists", "EMAIL_TAKEN");
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

  void sendVerificationEmail(user.email, verificationToken).catch((error) => {
    logger.error(
      { err: error, email: user.email, userId: user._id },
      "Background verification email failed",
    );
  });

  return { name, email };
};

export const verifyEmail = async (
  code: string,
): Promise<{ user: PublicUser }> => {
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

  void sendWelcomeEmail(user.email, user.name).catch((error) => {
    logger.error(
      { err: error, email: user.email, userId: user._id },
      "Background welcome email failed",
    );
  });

  return { user: toPublicUser(user) };
};

export const login = async (
  res: Response,
  input: LoginInput,
): Promise<{ user: PublicUser }> => {
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

  return { user: toPublicUser(user) };
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
  void sendPasswordResetEmail(user.email, resetURL).catch((error) => {
    logger.error(
      { err: error, email: user.email },
      "Background password reset email failed",
    );
  });
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

  void sendResetSuccessEmail(user.email).catch((error) => {
    logger.error(
      { err: error, email: user.email },
      "Background reset success email failed",
    );
  });
};

export const checkAuth = async (
  userId: string,
): Promise<{ user: PublicUser }> => {
  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw AppError.badRequest("User not found");
  }
  return { user: toPublicUser(user) };
};
