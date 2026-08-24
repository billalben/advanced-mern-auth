"use strict";

import isValidPassword from "./validatePassword.js";

/**
 * Validates the provided user fields.
 *
 * @param {string} name - The name of the user.
 * @param {string} email - The email address of the user.
 * @param {string} password - The password of the user.
 * @returns {object} An object containing a success boolean and a message array (type and error) or string.
 */
const validateSignup = (name, email, password) => {
  const errors = [];

  // Validate name
  if (!name || name.trim().length === 0) {
    errors.push({
      type: "name",
      error: "Name is required and cannot be empty.",
    });
  }

  // Validate email
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
  if (!email || !emailRegex.test(email)) {
    errors.push({
      type: "email",
      error: "A valid email address is required.",
    });
  }

  // Validate password
  const passwordMinLength = 6;
  if (!isValidPassword(password)) {
    errors.push({
      type: "password",
      error: `Password must be at least ${passwordMinLength} characters long and contain at least one letter, one number, and one special character.`,
    });
  }

  return {
    success: errors.length === 0,
    message: errors.length === 0 ? "" : errors,
  };
};

export default validateSignup;
