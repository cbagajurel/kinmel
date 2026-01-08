import express, { Router } from "express";
import {
  getUser,
  loginUser,
  refreshToken,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifyUser,
  verifyUserForgotPassword,
} from "../controller/auth.controller";
import { checkAuthentication } from "@packages/middleware/check_authentication";

const router: Router = express.Router();
router.post("/user-registration", userRegistration);
router.post("/verify-user", verifyUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.get("/user-detais", checkAuthentication, getUser);
router.post("/forgot-user-password", userForgotPassword);
router.post("/reset-user-password", resetUserPassword);
router.post("/verify-forgot-password", verifyUserForgotPassword);
export default router;
