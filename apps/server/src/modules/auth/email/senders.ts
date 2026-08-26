import { env } from "../../../config/env";
import { emailProvider } from "./provider";
import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  WELCOME_EMAIL_TEMPLATE,
} from "./templates";
import type { EmailAddress } from "./types";

const sender: EmailAddress = {
  email: env.EMAIL_FROM_EMAIL,
  name: env.EMAIL_FROM_NAME,
};

const requireField = (
  field: string,
  value: string | undefined,
  context: string,
): string => {
  if (!value) {
    throw new Error(`${field} is required to send ${context}`);
  }
  return value;
};

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
): Promise<void> => {
  const recipient = requireField("Email", email, "verification email");
  const token = requireField(
    "Verification token",
    verificationToken,
    "verification email",
  );

  await emailProvider.send({
    from: sender,
    to: [{ email: recipient }],
    subject: "Verify your email",
    html: VERIFICATION_EMAIL_TEMPLATE(token),
  });
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
): Promise<void> => {
  const recipient = requireField("Email", email, "welcome email");
  const recipientName = requireField("Name", name, "welcome email");

  await emailProvider.send({
    from: sender,
    to: [{ email: recipient }],
    subject: "Welcome to the app",
    html: WELCOME_EMAIL_TEMPLATE(recipientName),
  });
};

export const sendPasswordResetEmail = async (
  email: string,
  resetURL: string,
): Promise<void> => {
  const recipient = requireField("Email", email, "password reset email");
  const url = requireField("Reset URL", resetURL, "password reset email");

  await emailProvider.send({
    from: sender,
    to: [{ email: recipient }],
    subject: "Reset your password",
    html: PASSWORD_RESET_REQUEST_TEMPLATE(url),
  });
};

export const sendResetSuccessEmail = async (email: string): Promise<void> => {
  const recipient = requireField(
    "Email",
    email,
    "password reset success email",
  );

  await emailProvider.send({
    from: sender,
    to: [{ email: recipient }],
    subject: "Password Reset Successful",
    html: PASSWORD_RESET_SUCCESS_TEMPLATE(),
  });
};
