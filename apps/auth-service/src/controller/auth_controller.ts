import { NextFunction, Request, Response } from 'express';
import {
  checkOtpRestriction,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
  validateVerificationData,
  verifyOtp,
} from '../utils/auth_helper';
import prisma from '@packages/lib/prisma';
import { ValidationError } from '@packages/error-handler';
import bcrypt from 'bcryptjs';

export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, 'user');
    const { name, email } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(
        new ValidationError('User already exists with this email.'),
      );
    }

    await checkOtpRestriction(email);
    await trackOtpRequests(email);
    await sendOtp(name, email, 'user-activation-mail');

    res.status(200).json({
      message: 'OTP sent to email. Please verify your account',
    });
  } catch (error) {
    next(error);
  }
};



export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateVerificationData(req.body);
    const { email, otp, password, name } = req.body;

    const existingUser = await prisma.users.findUnique({ where: { email } });

    if (existingUser) {
      return next(new ValidationError('User already exists with this email!'));
    }

    await verifyOtp(email, otp);

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully!',
    });
  } catch (e) {
    return next(e);
  }
};

