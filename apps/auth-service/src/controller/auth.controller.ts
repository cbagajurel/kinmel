import { Request, Response, NextFunction } from "express";
import {
  checkOtpRestriction,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  verifyOtp,
  verifyUserForgotPasswordOtp,
} from "../utils/auth.helper";
import prismaClient from "@packages/lib/prisma";
import { AuthError, ValidationError } from "@packages/error-handler";
import bycript from "bcryptjs";
import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import { redisClient } from "@packages/lib/redis";
import Stripe from "stripe";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY!);

// User Registration
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existingUser = await prismaClient.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return next(
        new ValidationError("User already existes with this email. "),
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
  next: NextFunction,
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

// User login
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required!"));
    }
    const user = await prismaClient.users.findUnique({ where: { email } });

    if (!user) return next(new AuthError("User doesn`t exists!"));

    // verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError("Invalid email or password"));
    }

    // Generate access and refresh token
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      {
        expiresIn: "15m",
      },
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    //store the refresh and access token in an httpOnly secure cookie
    setCookie(res, "refresh_token", refreshToken);
    setCookie(res, "access_token", accessToken);

    res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    return next(error);
  }
};

//refresh token user
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      return new ValidationError("Unauthorized! NO refresh token.");
    }
    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; role: string };

    if (!decoded || !decoded.id || !decoded.role) {
      return new JsonWebTokenError("Forbidden! Invalid refresh token");
    }
    // let account;

    // if (decoded.role === "user") {
    const user = await prismaClient.users.findUnique({
      where: { id: decoded.id },
    });
    // }
    if (!user) {
      return new AuthError("Forbidden! User/Seller not founds");
    }
    const newAsccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    setCookie(res, "access_token", newAsccessToken);

    return res.status(201).json({ success: true });
  } catch (error) {
    return next(error);
  }
};

// get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

//Forgot Password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email } = req.body;
    await handleForgotPassword(email, next, "user");

    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    next(error);
  }
};

// verify forgot password OTP
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp } = req.body;
    const resetToken = await verifyUserForgotPasswordOtp(email, otp, next);

    res.status(200).json({
      message: "OTP verified. You can now reset your password.",
      resetToken,
    });
  } catch (error) {
    next(error);
  }
};

// Reset User Password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword, resetToken } = req.body;

    if (!email || !newPassword || !resetToken)
      return next(
        new ValidationError(
          "Email, new password, and reset token are required!",
        ),
      );

    const storedToken = await redisClient.get(`password_reset_token:${email}`);

    if (!storedToken || storedToken !== resetToken) {
      return next(
        new ValidationError(
          "Invalid or expired reset token! Please request a new password reset.",
        ),
      );
    }

    const user = await prismaClient.users.findUnique({ where: { email } });
    if (!user) return next(new ValidationError("User not found!"));

    const isSamePassword = await bcrypt.compare(newPassword, user.password!);

    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password cannot be the same as the old password!",
        ),
      );
    }

    // hash to new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prismaClient.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Delete the reset token (one-time use only)
    await redisClient.del(`password_reset_token:${email}`);

    res.status(200).json({ message: "Password reset successfully!" });
  } catch (error) {
    next(error);
  }
};

// seller login
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return next(new ValidationError("Email and password are required!"));
    const seller = await prismaClient.sellers.findUnique({ where: { email } });
    if (!seller) return next(new ValidationError("Invalid email or Password"));

    //verify password
    const isMatch = await bcrypt.compare(password, seller.password);
    if (!isMatch)
      return next(new ValidationError("Invalid email or password!"));

    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    // store refresh token and access token
    setCookie(res, "seller-refresh-token", refreshToken);
    setCookie(res, "seller-access-token", accessToken);

    res.status(200).json({
      message: "Login Successful!",
      seller: { id: seller.id, email: seller.email, name: seller.name },
    });
  } catch (error) {
    return next(error);
  }
};

// get logged in seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};

// Register Seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const exisitingSeller = await prismaClient.sellers.findUnique({
      where: { email },
    });

    if (exisitingSeller) {
      throw new ValidationError("Seller already exists with this email!");
    }

    await checkOtpRestriction(email, next);
    await trackOtpRequests(email, next);
    await sendOtp(name, email, "seller-activation-mail");

    res
      .status(200)
      .json({ message: "OTP sent to email. Please verify your account." });
  } catch (error) {
    next(error);
  }
};

// Verify seller with otp
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, phone_number, country } = req.body;
    if (!email || !otp || !password || !name || !phone_number || !country) {
    }

    const exisitingSeller = await prismaClient.sellers.findUnique({
      where: { email },
    });

    if (exisitingSeller) {
      return next(
        new ValidationError("Seller already exists with this email!"),
      );
    }
    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prismaClient.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    res
      .status(201)
      .json({ seller, message: "Seller registered Successfully! " });
  } catch (error) {
    next(error);
  }
};

// Create shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (!name || !bio || !address || !sellerId || !opening_hours || !category) {
      return next(new ValidationError("All Fields are required"));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== " ") {
      shopData.website = website;
    }

    const shop = await prismaClient.shops.create({
      data: shopData,
    });
    res.status(201).json({
      success: true,
      shop,
      message: "Shop create Successfully!",
    });
  } catch (error) {
    next(error);
  }
};

export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;
    if (!sellerId) return next(new ValidationError("Seller ID is required!"));

    const seller = await prismaClient.sellers.findUnique({
      where: {
        id: sellerId,
      },
    });
    if (!seller) {
      return next(new ValidationError("Seller is not available with this id!"));
    }
    const account = await stripe.accounts.create({
      type: "express",
      email: seller?.email,
      country: "US",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    await prismaClient.sellers.update({
      where: {
        id: sellerId,
      },
      data: {
        stripeId: account.id,
      },
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3000/success`,
      return_url: `http://localhost:3000/success`,
      type: "account_onboarding",
    });
    res.json({ url: accountLink.url });
  } catch (error) {
    console.error("Stripe Connect Error:", error);
    return next(error);
  }
};
