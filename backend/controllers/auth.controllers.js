"use strict";

import User from "../models/user.model.js";

export const signup = (req, res) => {
  res.send("Sign up route");
};

export const login = (req, res) => {
  res.send("Login route");
};

export const logout = (req, res) => {
  res.send("Logout route");
};
