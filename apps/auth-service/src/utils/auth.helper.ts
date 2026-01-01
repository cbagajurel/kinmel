import crypto from "crypto";
import { ValidationError } from "@packages/error-handler";
import { redisClient } from "@packages/lib/redis";
import { sendEmail } from "./send-mail";
import { NextFunction } from "express";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegistrationData = (
  data: any,
  userType: "user" | "seller"
) => {
  const { name, email, password, phone_number, country } = data;

  if (
    !name ||
    !email ||
    !password ||
    (userType === "seller" && (!phone_number || !country))
  ) {
    throw new ValidationError(`Missing required fields!`);
  }

  if (!emailRegex.test(email)) {
    throw new ValidationError(`Invalid Email format`);
  }
};

export const checkOtpRestriction = async (
  email: string,
  next: NextFunction
) => {
  if (await redisClient.get(`otp_lock:${email}`)) {
    return next(
      new ValidationError(
        "Account locked due to multiple failed attempts! Try again after 30 minutes"
      )
    );
  }

  if (await redisClient.get(`otp_spam_lock:${email}`)) {
    return next(
      new ValidationError(
        "Too many OTP requests! Please wait 1 hour before requesting again."
      )
    );
  }

  if (await redisClient.get(`otp_cooldown:${email}`)) {
    return next(
      new ValidationError("Please wait 1 minute before requesting a new OTP")
    );
  }
};

export const trackOtpRequests = async (email: string, next: NextFunction) => {
  const otpRequestKey = `otp_request_count:${email}`;
  const otpRequests = parseInt((await redisClient.get(otpRequestKey)) || "0");
  if (otpRequests >= 2) {
    await redisClient.set(
      `otp_spam_lock:${email}`,
      "locked",
      "EX",
      3600 //1hr
    );
    throw next(
      new ValidationError(
        "Too many OTP requests. Please wait 1 hour before requesting again."
      )
    );
  }

  await redisClient.set(otpRequestKey, otpRequests + 1, "EX", 3600);
};

export const sendOtp = async (
  name: string,
  email: string,
  template: string
) => {
  const otp = crypto.randomInt(1000, 9999).toString();
  await sendEmail(email, "Verify your email", template, { name, otp });

  await redisClient.set(
    `otp:${email}`,
    otp,
    "EX",
    300 // 5 minutes
  );

  await redisClient.set(
    `otp_cooldown:${email}`,
    "true",
    "EX",
    60 // 1 minute
  );
};

export const verifyOtp = async (
  email: string,
  otp: string,
  next: NextFunction
) => {
  const storedOtp = await redisClient.get(`otp:${email}`);
  if (!storedOtp) {
    throw next(new ValidationError("Invalid or expired OTP!"));
  }
  const failedAttemptsKey = `otp_attempts:${email}`;

  const failedAttempts = parseInt(
    (await redisClient.get(failedAttemptsKey)) || "0"
  );

  if (storedOtp !== otp) {
    if (failedAttempts >= 2) {
      await redisClient.set(`otp_lock:${email}`, "locked", "EX", 1800);
      await redisClient.del(`otp:${email}`, failedAttemptsKey);
      throw next(
        new ValidationError(
          "Too many failed attempts. Your account locked for 30 minutes"
        )
      );
    }
    await redisClient.set(failedAttemptsKey, failedAttempts + 1, "EX", 300);
    throw next(
      new ValidationError(`Incorrect OTP. ${2 - failedAttempts} attempts left.`)
    );
  }

  await redisClient.del(`otp:${email}`, failedAttemptsKey);
};
