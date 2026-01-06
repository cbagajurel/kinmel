import React, { useState } from "react";
import { FieldErrors, UseFormRegister, RegisterOptions } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface InputProps<T extends Record<string, any>> {
  name: keyof T;
  label?: string;
  type?: string;
  placeholder?: string;
  className?: string;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  rules?: RegisterOptions<T, any>;
  showPasswordToggle?: boolean;
}

const Input = <T extends Record<string, any>>({
  name,
  label,
  type = "text",
  placeholder,
  className = "",
  register,
  errors,
  rules,
  showPasswordToggle = false,
}: InputProps<T>) => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const errorMessage = errors[name]?.message as string | undefined;

  const isPasswordField = type === "password";
  const inputType = isPasswordField && passwordVisible ? "text" : type;

  return (
    <div className="mb-3">
      {label && (
        <label className="block mb-1 font-Roboto text-gray-700 text-sm">
          {label}
        </label>
      )}

      <div className="relative">
        <input
          type={inputType}
          placeholder={placeholder}
          className={`p-2 border rounded-sm outline-0 w-full  text-sm${
            isPasswordField && showPasswordToggle ? "pr-10" : ""
          }
          ${errorMessage ? "border-red-500" : "border-gray-300"}
          ${className}`}
          {...register(name as any, rules)}
        />

        {isPasswordField && showPasswordToggle && (
          <button
            type="button"
            onClick={() => setPasswordVisible(!passwordVisible)}
            className="top-1/2 right-3 absolute flex items-center -translate-y-1/2"
          >
            {passwordVisible ? (
              <Eye size={20} color="gray" />
            ) : (
              <EyeOff size={20} color="gray" />
            )}
          </button>
        )}
      </div>

      {errorMessage && (
        <p className="mt-1 text-red-500 text-sm">{errorMessage}</p>
      )}
    </div>
  );
};

export default Input;
