"use strict";

/**
 * Template for the verification email.
 * @param {string} verificationToken - The verification token to include in the email.
 * @returns {string} - The email template with the verification token.
 */

export const VERIFICATION_EMAIL_TEMPLATE = (verificationToken = "ERROR") => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #4CAF50, #369d3b); padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; letter-spacing: 4px;">Verify Your Email</h1>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px;">
        <p>Hello,</p>
        <p>Thank you for signing up! Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">${verificationToken}</span>
        </div>
        <p>
          Enter this code on the verification page to complete your registration. <br />
          This code will expire in 1 hour for security reasons. <br />
          If you didn't create an account with us, please ignore this email.
        </p>
        <p>Best regards,<br>Your App Team</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
        <p>This is an automated message, please do not reply to this email.</p>
      </div>
    </body>
    </html>
  `;
};