import { Router } from "express";
import * as ctrl from "./auth.controllers";
import { validateAll } from "../../shared/middlewares/validate";
import { requireAuth } from "../../shared/middlewares/requireAuth";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
  verifyEmailSchema,
} from "./auth.schemas";

export const authRouter: Router = Router();

authRouter.get("/check-auth", requireAuth, ctrl.checkAuth);

authRouter.post("/signup", validateAll(signupSchema), ctrl.signup);
authRouter.post("/login", validateAll(loginSchema), ctrl.login);
authRouter.post("/logout", ctrl.logout);

authRouter.post(
  "/verify-email",
  validateAll(verifyEmailSchema),
  ctrl.verifyEmail,
);
authRouter.post(
  "/forgot-password",
  validateAll(forgotPasswordSchema),
  ctrl.forgotPassword,
);
authRouter.post(
  "/reset-password/:token",
  validateAll(resetPasswordSchema),
  ctrl.resetPassword,
);
