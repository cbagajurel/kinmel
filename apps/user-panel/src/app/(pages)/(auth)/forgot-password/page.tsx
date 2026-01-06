"use client";
import Input from "apps/user-panel/src/components/ui/input";
import { useRouter } from "next/navigation";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FormDataType } from "../global";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import toast from "react-hot-toast";
import CustomButton from "apps/user-panel/src/components/ui/button";

const ForgotPasswordPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);

  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [canResend, setCanResend] = useState(true);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();

  const startResendTimer = () => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const requestOtpMutations = useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/forgot-user-password`,
        { email }
      );
      return response.data;
    },
    onSuccess: (_, { email }) => {
      setUserEmail(email);
      setStep("otp");
      setServerError(null);
      setCanResend(false);
      startResendTimer();
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid OTP. Try again!";
      setServerError(errorMessage);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userEmail) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-forgot-password`,
        { email: userEmail, otp: otp.join("") }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setResetToken(data.resetToken);
      setStep("reset");
      setServerError(null);
    },
  });

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };
  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const onSubmitEmail = ({ email }: { email: string }) => {
    requestOtpMutations.mutate({ email });
  };
  const onSubmitPassword = ({ password }: { password: string }) => {
    resetPasswordMutation.mutate({ password });
  };

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      if (!password || !resetToken) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/reset-user-password`,
        { email: userEmail, newPassword: password, resetToken }
      );

      return response.data;
    },
    onSuccess: () => {
      setStep("email");
      toast.success(
        "password reset Successfully! Please login with your new password"
      );
      router.push("/login");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Failed to reset password";

      setServerError(errorMessage);
    },
  });

  const resendOtp = () => {
    resendOtp();
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataType>();

  return (
    <div className="bg-[#f1f1f1] py-10 w-full min-h-[85vh]">
      <h1 className="font-poppins font-semibold text-3xl text-center">Login</h1>
      <p className="py-3 font-medium text-[#00000099] text-sm text-center">
        Home . Forgot Password
      </p>
      <div className="flex justify-center w-full">
        <div className="bg-white shadow p-5 rounded-lg md:w-[480px]">
          {step === "email" && (
            <>
              <h3 className="mb-2 font-semibold text-2xl text-center">
                Forgot Password
              </h3>

              <div className="flex items-center my-5 text-gray-400 text-sm">
                <div className="flex-1 border-gray-300 border-t" />
                <span className="px-3">or Sign in with Email</span>
                <div className="flex-1 border-gray-300 border-t" />
              </div>
              <form onSubmit={handleSubmit(onSubmitEmail)}>
                <div className="relative">
                  <Input<FormDataType>
                    name="email"
                    label="Email"
                    placeholder="Enter your email"
                    register={register}
                    errors={errors}
                    rules={{
                      required: "Email is required!",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Invalid email address",
                      },
                    }}
                  />
                </div>

                <button
                  disabled={requestOtpMutations.isPending}
                  type="submit"
                  className="bg-blue-600 py-2 rounded-sm w-full text-white text-sm cursor-pointer"
                  onClick={() => {}}
                >
                  {requestOtpMutations.isPending ? "Loggin in ... " : "Login"}
                </button>
                {serverError && (
                  <p className="mt-2 text-red-500 text-sm">{serverError}</p>
                )}
              </form>
            </>
          )}

          {step === "otp" && (
            <div>
              <h3 className="mb-4 font-semibold text-xl text-center">
                Enter Otp
              </h3>
              <div className="flex justify-center gap-6">
                {otp?.map((digit, index) => (
                  <input
                    type="text"
                    key={index}
                    ref={(el) => {
                      if (el) inputRefs.current[index] = el;
                    }}
                    maxLength={1}
                    className="border border-gray-300 rounded-md outline-none w-12 h-12 text-center"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  />
                ))}
              </div>
              <CustomButton
                disabled={verifyOtpMutation.isPending}
                onClick={() => verifyOtpMutation.mutate()}
                label={verifyOtpMutation.isPending ? "Verifying" : "Verify OTP"}
                className="mt-8"
              />
              {canResend ? (
                <div
                  onClick={resendOtp}
                  className="flex justify-center items-center mt-3 text-blue-600 text-sm hover:underline hover:cursor-pointer"
                >
                  <span> Resend OTP</span>
                </div>
              ) : (
                <p className="mt-3 text-gray-500 text-sm text-center">
                  Resend OTP in {timer}s
                </p>
              )}
              {verifyOtpMutation?.isError &&
                verifyOtpMutation.error instanceof AxiosError && (
                  <p className="mt-2 text-red-500 text-sm">
                    {verifyOtpMutation.error.response?.data?.message ||
                      verifyOtpMutation.error.message}
                  </p>
                )}
            </div>
          )}

          {step === "reset" && (
            <>
              <h3 className="mb-4 font-semibold text-xl text-center">
                Reset Password
              </h3>
              <form onSubmit={handleSubmit(onSubmitPassword)}>
                <div className="relative">
                  <Input<FormDataType>
                    name="password"
                    label="New Password"
                    type={passwordVisible ? "text" : "password"}
                    placeholder="Enter New Password"
                    register={register}
                    errors={errors}
                    rules={{
                      required: "Password is required!",
                      minLength: {
                        value: 6,
                        message: "password must be at least 6 characters",
                      },
                    }}
                  />
                </div>

                <button
                  disabled={resetPasswordMutation.isPending}
                  type="submit"
                  className="bg-blue-600 mt-4 py-2 rounded-sm w-full text-white text-sm cursor-pointer"
                >
                  {resetPasswordMutation.isPending
                    ? "Resetting....."
                    : "Reset Password"}
                </button>
                {serverError && (
                  <p className="mt-2 text-red-500 text-sm">{serverError}</p>
                )}
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
