"use strict";

import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

/**
 * Sends a verification email to the specified email address.
 * @param {string} email - The email address to send the verification email to.
 * @param {string} verificationToken - The verification token to include in the email.
 * @throws {Error} When the email or verification token is missing.
 */

export const sendVerificationEmail = async (email, verificationToken) => {
  if (!email || !verificationToken) {
    throw new Error(
      "Email and verification token are required to send an email"
    );
  }

  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE(verificationToken),
      category: "Email Verification",
    });
  } catch (error) {
    throw new Error(`Error sending verification email: ${error}`);
  }
};

/**
 * Sends a welcome email to the specified email address.
 * @param {string} email - The email address to send the welcome email to.
 * @param {string} name - The name of the user to include in the email.
 * @throws {Error} When the email or name is missing.
 */

export const sendWelcomeEmail = async (email, name) => {
  if (!email || !name) {
    throw new Error("Email and name are required to send a welcome email");
  }

  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "739d66c1-6807-4481-9158-917366e6432b",
      template_variables: {
        company_info_name: "Auth Company",
        name,
      },
    });
  } catch (error) {
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

/**
 * Sends URL to reset the password to the specified email address.
 * @param {string} email - The email address to send the password reset email to.
 * @param {string} resetURL - The URL to include in the email.
 * @throws {Error} When the email or reset URL is missing.
 */

export const sendPasswordResetEmail = async (email, resetURL) => {
  if (!email || !resetURL) {
    throw new Error(
      "Email and reset URL are required to send a password reset email"
    );
  }

  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE(resetURL),
      category: "Password Reset",
    });
  } catch (error) {
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email) => {
  if (!email) {
    throw new Error("Email is required to send a password reset success email");
  }

  const recipient = [{ email }];

  try {
    await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password Reset Successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE(),
      category: "Password Reset",
    });
  } catch (error) {
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
