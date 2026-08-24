import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates";
import { mailtrapClient, sender } from "./mailtrap.config";
import { logger } from "../../../config/logger";

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
): Promise<void> => {
  if (!email || !verificationToken) {
    throw new Error(
      "Email and verification token are required to send an email",
    );
  }

  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE(verificationToken),
      category: "Email Verification",
    });
  } catch (error) {
    logger.error({ err: error }, "Error sending verification email");
    throw new Error("Error sending verification email");
  }
};

export const sendWelcomeEmail = async (
  email: string,
  name: string,
): Promise<void> => {
  if (!email || !name) {
    throw new Error("Email and name are required to send a welcome email");
  }

  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email }],
      template_uuid: "739d66c1-6807-4481-9158-917366e6432b",
      template_variables: {
        company_info_name: "Auth Company",
        name,
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Error sending welcome email");
    throw new Error("Error sending welcome email");
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetURL: string,
): Promise<void> => {
  if (!email || !resetURL) {
    throw new Error(
      "Email and reset URL are required to send a password reset email",
    );
  }

  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE(resetURL),
      category: "Password Reset",
    });
  } catch (error) {
    logger.error({ err: error }, "Error sending password reset email");
    throw new Error("Error sending password reset email");
  }
};

export const sendResetSuccessEmail = async (email: string): Promise<void> => {
  if (!email) {
    throw new Error(
      "Email is required to send a password reset success email",
    );
  }

  try {
    await mailtrapClient.send({
      from: sender,
      to: [{ email }],
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE(),
      category: "Password Reset",
    });
  } catch (error) {
    logger.error({ err: error }, "Error sending reset success email");
    throw new Error("Error sending password reset success email");
  }
};
