"use client";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FormDataType, Input } from "@/app/shared";
import CustomButton from "@/app/shared/components/button";
import { countries } from "@/utils/countries";

const SignUp = () => {
  const [activeStep, setActiveStep] = useState(1);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showOtp, setShowOtp] = useState(false);
  const [canResend, setCanResend] = useState(true);

  const [timer, setTimer] = useState(60);
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [userData, setUserData] = useState<FormDataType | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataType>();

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

  const signupMutation = useMutation({
    mutationFn: async (data: FormDataType) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/user-registration`,
        data
      );
      return response.data;
    },
    onSuccess: (_, FormData) => {
      setUserData(FormData);
      setShowOtp(true);
      setCanResend(false);
      setTimer(60);
      startResendTimer();
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async () => {
      if (!userData) return;
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/verify-user`,
        {
          ...userData,
          otp: otp.join(""),
        }
      );
      return response.data;
    },
    onSuccess: () => {
      router.push("/login");
    },
  });

  const onSubmit = async (data: FormDataType) => {
    signupMutation.mutate(data);
  };

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

  const resendOtp = () => {
    if (userData) {
      signupMutation.mutate(userData);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10 w-full min-h-screen">
      {/*Stepper

      */}
      <div className="relative flex justify-between items-center mb-8 md:w-[50%]">
        <div className="top-[25%] left-0 z-1 absolute bg-gray-300 w-[80%] md:w-[90%] h-1" />

        {[1, 2, 3].map((step) => (
          <div key={step} className="z-10 flex flex-col">
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full text-white font-bold ${
                step <= activeStep ? "bg-blue-700" : "bg-gray-300"
              }`}
            >
              {step}
            </div>

            <span className="ml-[-15px]">
              {step === 1
                ? "Create Account"
                : step === 2
                ? "Setup Shop"
                : "Connect Bank"}
            </span>
          </div>
        ))}
      </div>
      {/*Steps Content */}
      <div className="bg-white shadow p-8 rounded-lg md:w-[480px]">
        {!showOtp ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <h3 className="mb-10 font-semibold text-2xl text-center">
              Create Account
            </h3>
            <div className="relative">
              <Input<FormDataType>
                name="name"
                label="Full Name"
                placeholder="Enter your Full Name"
                register={register}
                errors={errors}
                rules={{
                  required: "Name is required!",
                }}
              />
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

              <Input<FormDataType>
                name="phone"
                label="Phone Number"
                type="tel"
                placeholder="+977 98********"
                register={register}
                errors={errors}
                rules={{
                  required: "Phone number is required!",
                  minLength: {
                    value: 10,
                    message: "Phone number must be at least 10 digits",
                  },
                  maxLength: {
                    value: 20,
                    message: "Phone number is too long",
                  },
                  pattern: {
                    value: /^\+?[0-9\s()-]{10,20}$/,
                    message: "Invalid phone number format",
                  },
                }}
              />

              <div className="mb-3">
                <label className="block mb-1 text-gray-700">Country</label>
                <select
                  className="p-2 border border-gray-300 rounded-[4px] outline-0 w-full"
                  {...register("country", { required: "Country is required" })}
                >
                  <option value="">Select Your Country</option>
                  {countries.map((country) => (
                    <option value={country.code} key={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
                {errors.country && (
                  <p className="text-red-600 text-sm">
                    {String(errors.country.message)}
                  </p>
                )}
              </div>

              <Input<FormDataType>
                name="password"
                label="Password"
                type={passwordVisible ? "text" : "password"}
                placeholder="Password your email"
                register={register}
                errors={errors}
                showPasswordToggle={true}
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
              disabled={signupMutation.isPending}
              type="submit"
              className="bg-blue-600 mt-4 py-2 rounded-sm w-full text-white text-sm cursor-pointer"
              onClick={() => {}}
            >
              {signupMutation.isPending ? "Signing up....." : "Sign Up"}
            </button>
            {signupMutation.isError &&
              signupMutation.error instanceof AxiosError && (
                <p className="mt-2 text-red-600 text-sm">
                  {signupMutation.error.response?.data?.message ||
                    signupMutation.error.message}
                </p>
              )}
          </form>
        ) : (
          <div>
            <h3 className="mb-10 font-semibold text-xl text-center">
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
                <p className="mt-2 text-red-600 text-sm">
                  {verifyOtpMutation.error.response?.data?.message ||
                    verifyOtpMutation.error.message}
                </p>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignUp;
