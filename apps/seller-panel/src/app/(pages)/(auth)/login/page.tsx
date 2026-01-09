"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { FormDataType, Input } from "@/app/shared";

const LoginPage = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormDataType>();

  const loginMutation = useMutation({
    mutationFn: async (data: FormDataType) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URI}/api/login`,
        data,
        { withCredentials: true }
      );
      return response.data;
    },
    onSuccess: (data) => {
      setServerError(null), router.push("/");
    },
    onError: (error: AxiosError) => {
      const errorMessage =
        (error.response?.data as { message?: string })?.message ||
        "Invalid Credentials!";
      setServerError(errorMessage);
    },
  });

  const onSubmit = async (data: FormDataType) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="bg-[#f1f1f1] py-10 w-full min-h-screen">
      <h1 className="font-poppins font-semibold text-3xl text-center">Login</h1>
      <p className="py-3 font-medium text-[#00000099] text-sm text-center">
        Home . Login
      </p>
      <div className="flex justify-center w-full">
        <div className="bg-white shadow p-5 rounded-lg md:w-[480px]">
          <h3 className="mb-2 font-semibold text-2xl text-center">
            Login to Kinmel
          </h3>
          <p className="mb-4 text-gray-500 text-sm text-center">
            Don't have an account?{" "}
            <Link href={"/signup"} className="text-blue-500">
              Sign up
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
          <form onSubmit={handleSubmit(onSubmit)}>
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
            <div className="flex justify-between items-center my-4">
              <label className="flex items-center text-gray-600">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>
              <Link
                href={"/forgot-password"}
                className="text-blue-600 text-sm hover:underline"
              >
                Forgot Password
              </Link>
            </div>
            <button
              disabled={loginMutation.isPending}
              type="submit"
              className="bg-blue-600 py-2 rounded-sm w-full text-white text-sm cursor-pointer"
              onClick={() => {}}
            >
              {loginMutation.isPending ? "Loggin in ... " : "Login"}
            </button>
            {serverError && (
              <p className="mt-2 text-red-500 text-sm">{serverError}</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
