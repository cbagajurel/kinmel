import { Request, Response, NextFunction } from "express";
import {
  checkOtpRestriction,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
} from "../utils/auth.helper";
import prismaClient from "@packages/lib/prisma";
import { ValidationError } from "@packages/error-handler";
import bycript from "bcryptjs";

// User Registration
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prismaClient.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(
        new ValidationError("User already existes with this email. ")
      );
    }

    await checkOtpRestriction(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    next(error);
  }
};

// Verify User with OTP

export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;
    if (!email || !otp || !password || !name) {
      return next(new ValidationError("Missing required fields!"));
    }

    const existingUser = await prismaClient.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(new ValidationError("User already exists with this email!"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bycript.hash(password, 10);
    await prismaClient.users.create({
      data: { name, email, password: hashedPassword },
    });
    res.status(201).json({
      success: true,
      message: "User registerd successfully!",
    });
  } catch (error) {
    return next(error);
  }
};
