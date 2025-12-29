import { NextFunction, Request, Response } from 'express';
import {
  checkOtpRestriction,
  sendOtp,
  trackOtpRequests,
  validateRegistrationData,
} from '../utils/auth_helper';
import prisma from '@packages/lib/prisma';
import { ValidationError } from '@packages/error-handler';

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
        new ValidationError('User already existes with this email. '),
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
