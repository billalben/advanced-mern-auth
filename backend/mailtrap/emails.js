"use strict";

import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js";
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
