import jwt from "jsonwebtoken";

/**
 * Generates a JWT token and sets it as a cookie in the response.
 *
 * @param {import('express').Response} res - The Express response object to set the cookie on.
 * @param {string} userId - The ID of the user for whom the token is being generated.
 * @throws {Error} Throws an error if the JWT secret is not defined, or if there is an issue with token generation.
 */

const setAuthToken = (res, userId) => {
  // Define constants for token and cookie expiration
  const TOKEN_EXPIRATION = "1d";
  const COOKIE_EXPIRATION = 86_400_000; // 1 day in milliseconds

  try {
    // Generate a JWT token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: TOKEN_EXPIRATION,
    });

    // Set cookie options
    const cookieOptions = {
      httpOnly: true, // Ensures the cookie is only accessible via HTTP(S) and not JavaScript, mitigating XSS attacks.
      secure: process.env.NODE_ENV === "production", // Ensures the cookie is sent only over HTTPS in production.
      sameSite: "strict", // Ensures the cookie is sent only to the same domain.
      maxAge: COOKIE_EXPIRATION, // Sets the expiration time for the cookie, matching the token's expiration.
    };

    // Set the cookie with the token
    res.cookie("token", token, cookieOptions);
  } catch (error) {
    throw new Error("Token generation failed.");
  }
};

export default setAuthToken;
