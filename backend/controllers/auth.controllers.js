"use strict";

import bcryptjs from "bcryptjs";
import crypto from "crypto";

import User from "../models/user.model.js";

import setAuthToken from "../utils/setAuthToken.js";
import validateSignup from "../utils/validateSignup.js";
import {
  sendPasswordResetEmail,
  sendResetSuccessEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from "../mailtrap/emails.js";
import isValidPassword from "../utils/validatePassword.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const { message, success } = validateSignup(name, email, password);

    // If validation fails, return the error message
    if (!success) return res.status(400).json({ success, message });

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100_000 + Math.random() * 900_000
    ).toString();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 3_600_000, // 1 hour in milliseconds
    });

    await sendVerificationEmail(user?.email, verificationToken);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        name,
        email,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error?.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res
      .status(400)
      .json({ success: false, message: "Verification code is required" });
  }

  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationTokenExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    await user.save();

    await sendWelcomeEmail(user?.email, user?.name);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user?._doc,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    setAuthToken(res, user._id);

    user.lastLogin = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error?.message });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(10).toString("hex");
    const resetTokenExpiresAt = Date.now() + 1_800_000; // 30 minutes in milliseconds

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;

    await user.save();

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-password/${resetToken}`
    );

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error?.message });
  }
};

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!token || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Token and password are required" });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 6 characters long and contain at least one letter, one number, and one special character.",
    });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired reset token" });
    }

    // update password
    const hashedPassword = await bcryptjs.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    await sendResetSuccessEmail(user.email);

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error?.message });
  }
};

export const checkAuth = async (req, res) => {
  try {
    // Get user details from the database and exclude the password field
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
