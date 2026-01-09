import express, { Router } from "express";
import {
  createShop,
  getUser,
  loginUser,
  refreshToken,
  registerSeller,
  resetUserPassword,
  userForgotPassword,
  userRegistration,
  verifySeller,
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

// Seller
router.post("/seller-registration", registerSeller);
router.post("/verify-seller", verifySeller);
router.post("/create-shop", createShop);

export default router;
