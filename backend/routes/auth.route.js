"use strict";

import express from "express";

// Import the signup, login, and logout controller functions
import { signup, login, logout } from "../controllers/auth.controllers.js";

const router = express.Router();

router.get("/signup", signup);

router.get("/login", login);

router.get("/logout", logout);

export default router;
