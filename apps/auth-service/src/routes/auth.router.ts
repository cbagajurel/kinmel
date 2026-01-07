import express, { Router } from "express";
import {
  loginUser,
  refreshToken,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from "../controller/auth.controller";

const router: Router = express.Router();
router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/forgot-user-password", userForgotPassword);
router.post("/reset-user-password", resetUserPassword);
router.post("/verify-forgot-password", verifyUserForgotPassword);
export default router;
