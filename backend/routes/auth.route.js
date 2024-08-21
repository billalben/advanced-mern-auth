"use strict";

import express from "express";

// Import the signup, login, and logout controller functions
import { signup, login, logout } from "../controllers/auth.controllers.js";

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
