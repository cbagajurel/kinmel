"use client";
import Input from "apps/user-panel/src/components/ui/input";
import Link from "next/link";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FormDataType } from "../global";
import CustomButton from "apps/user-panel/src/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";

const SignUp = () => {
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
    <div className="bg-[#f1f1f1] py-10 w-full min-h-[85vh]">
      <h1 className="font-poppins font-semibold text-3xl text-center">
        Signup
      </h1>
      <p className="py-3 font-medium text-[#00000099] text-sm text-center">
        Home . SignUp
      </p>
      <div className="flex justify-center w-full">
        <div className="bg-white shadow p-5 rounded-lg md:w-[480px]">
          <h3 className="mb-2 font-semibold text-2xl text-center">
            Signup to Kinmel
          </h3>
          <p className="mb-4 text-gray-500 text-sm text-center">
            Already have an account?{" "}
            <Link href={"/login"} className="text-blue-500">
              Login
            </Link>
          </p>
          <div className="items-center bg-blue-600 hover:bg-blue-500 p-2 rounded-sm hover:cursor-pointer">
            <p className="text-white text-sm text-center">
              Continue with google
            </p>
          </div>
          <div className="flex items-center my-5 text-gray-400 text-sm">
            <div className="flex-1 border-gray-300 border-t" />
            <span className="px-3">or Sign in with Email</span>
            <div className="flex-1 border-gray-300 border-t" />
          </div>
          {!showOtp ? (
            <form onSubmit={handleSubmit(onSubmit)}>
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
              {serverError && (
                <p className="mt-2 text-red-500 text-sm">{serverError}</p>
              )}
            </form>
          ) : (
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
        </div>
      </div>
    </div>
  );
};

export default SignUp;
