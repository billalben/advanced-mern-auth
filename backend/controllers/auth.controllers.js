"use strict";

import bcryptjs from "bcryptjs";

import User from "../models/user.model.js";

import setAuthToken from "../utils/setAuthToken.js";
import validateSignup from "../utils/validateSignup.js";
import { sendVerificationEmail, sendWelcomeEmail } from "../mailtrap/emails.js";

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

    setAuthToken(res, user._id);

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

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user?._doc,
        password: undefined,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = (req, res) => {
  res.send("Login route");
};

export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ success: true, message: "Logged out successfully" });
};
