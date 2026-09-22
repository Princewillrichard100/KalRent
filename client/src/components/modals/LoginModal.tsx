"use client";

import { useState, useCallback } from "react";
import { signIn } from "aws-amplify/auth";
import { toast } from "sonner";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useRegisterModal } from "@/hooks/useRegisterModal";
import Modal from "./Modal";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onToggle = useCallback(() => {
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const onSubmit = useCallback(async () => {
    if (!email || !password) {
      toast.error("Please fill in both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email.trim(),
        password,
      });

      if (isSignedIn) {
        toast.success("Signed in successfully!");
        loginModal.onClose();
        window.location.reload();
      } else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        toast.info("Account not verified yet. Please check your email for the code.");
        loginModal.onClose();
        registerModal.onOpen();
      } else {
        toast.info(`Next step: ${nextStep.signInStep}`);
      }
    } catch (err: any) {
      console.error("Sign in error:", err);
      toast.error(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, loginModal, registerModal]);

  const bodyContent = (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Welcome back to KalRent
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Log in to manage your student hostels, saved favorites, and escrow leases.
        </p>
      </div>

      <div className="space-y-3 pt-2">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              placeholder="student@unilorin.edu.ng"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const footerContent = (
    <div className="flex flex-col gap-3 mt-2 text-center">
      <div className="text-xs text-slate-500">
        First time using KalRent?{" "}
        <button
          type="button"
          onClick={onToggle}
          className="text-rose-500 hover:underline font-semibold cursor-pointer"
        >
          Create an account
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title="Login"
      actionLabel={isLoading ? "Signing in..." : "Continue"}
      onClose={loginModal.onClose}
      onSubmit={onSubmit}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default LoginModal;
