"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuthStore } from "@/store/use-auth-store";
import { FcGoogle } from "react-icons/fc";
import { BsEye, BsEyeSlash } from "react-icons/bs";

const LoginPage = () => {
  const { login } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 flex justify-center">
          <Image src="/logo.svg" alt="CoLabs" width={48} height={48} />
        </div>

        <h1 className="mb-6 text-center text-2xl font-semibold text-neutral-800">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>

        <button
          onClick={login}
          className="flex w-full items-center justify-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-sm"
        >
          <FcGoogle className="text-xl" />
          Sign in with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-neutral-200" />
          <span className="text-sm text-neutral-400">or</span>
          <div className="h-px flex-1 bg-neutral-200" />
        </div>

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex flex-col gap-3"
        >
          {isSignUp && (
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="First Name"
                className="w-1/2 rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-1/2 rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
              />
            </div>
          )}

          <input
            type="email"
            placeholder="Email"
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 pr-10 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              {showPassword ? (
                <BsEyeSlash className="text-lg" />
              ) : (
                <BsEye className="text-lg" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled
            className="mt-2 w-full rounded-full bg-neutral-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSignUp ? "Create account" : "Log in"}
          </button>
        </form>

        {isSignUp && (
          <p className="mt-4 text-center text-xs text-neutral-400">
            Signing up for CoLabs means you agree to the{" "}
            <span className="font-medium text-neutral-600 underline cursor-pointer">
              Privacy Policy
            </span>{" "}
            and{" "}
            <span className="font-medium text-neutral-600 underline cursor-pointer">
              Terms of Service
            </span>
            .
          </p>
        )}

        <p className="mt-6 text-center text-sm text-neutral-500">
          {isSignUp ? "Have an account?" : "Don\u0027t have an account?"}{" "}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="font-medium text-neutral-800 underline hover:text-neutral-600"
          >
            {isSignUp ? "Log in here" : "Sign up here"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
