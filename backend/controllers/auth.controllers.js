"use strict";

import bcryptjs from "bcryptjs";

import User from "../models/user.model.js";

import setAuthToken from "../utils/setAuthToken.js";
import validateSignup from "../utils/validateSignup.js";
import { json } from "express";
import { sendVerificationEmail } from "../mailtrap/emails.js";

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
      verificationTokenExpiresAt: Date.now() + 86_400_000, // 24 hours in milliseconds
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

export const login = (req, res) => {
  res.send("Login route");
};

export const logout = (req, res) => {
  res.send("Logout route");
};
