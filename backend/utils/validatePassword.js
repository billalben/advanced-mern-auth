"use strict";

/**
 * Validates the password to ensure it meets the required criteria.
 * @param {string} password - The password to validate.
 * @param {number} passwordMinLength - The minimum length of the password.
 * @returns {boolean} - Returns true if the password is valid, false otherwise.
 */

const isValidPassword = (password, passwordMinLength = 6) => {
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

  if (
    !password ||
    password.length < passwordMinLength ||
    !passwordRegex.test(password)
  ) {
    return false;
  }

  return true;
};

export default isValidPassword;
