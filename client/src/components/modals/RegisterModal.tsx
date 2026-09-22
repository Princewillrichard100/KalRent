"use client";

import { useState, useCallback } from "react";
import { signUp, confirmSignUp, resendSignUpCode, signIn } from "aws-amplify/auth";
import { toast } from "sonner";
import { useRegisterModal } from "@/hooks/useRegisterModal";
import { useLoginModal } from "@/hooks/useLoginModal";
import Modal from "./Modal";
import { Mail, Lock, User, Phone, KeyRound, ShieldCheck } from "lucide-react";

enum STEPS {
  FORM = 0,
  CONFIRM = 1,
}

export const RegisterModal = () => {
  const registerModal = useRegisterModal();
  const loginModal = useLoginModal();

  const [step, setStep] = useState(STEPS.FORM);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<"tenant" | "manager">("tenant");
  const [password, setPassword] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onToggle = useCallback(() => {
    registerModal.onClose();
    loginModal.onOpen();
  }, [registerModal, loginModal]);

  const handleSignUp = useCallback(async () => {
    if (!email || !password || !name || !phoneNumber) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);

    try {
      // Format phone number with Nigerian country code if necessary
      let formattedPhone = phoneNumber.trim();
      if (formattedPhone.startsWith("0")) {
        formattedPhone = `+234${formattedPhone.slice(1)}`;
      } else if (!formattedPhone.startsWith("+")) {
        formattedPhone = `+234${formattedPhone}`;
      }

      await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: {
            email: email.trim(),
            phone_number: formattedPhone,
            name: name.trim(),
            "custom:role": role,
          },
        },
      });

      toast.success("Verification code sent! Please check your email.");
      setStep(STEPS.CONFIRM);
    } catch (err: any) {
      console.error("Sign up error:", err);
      toast.error(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, name, phoneNumber, role]);

  const handleConfirmCode = useCallback(async () => {
    if (!confirmationCode) {
      toast.error("Please enter the 6-digit verification code.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode: confirmationCode.trim(),
      });

      toast.success("Email verified! Signing you in...");

      // Automatically sign in
      try {
        await signIn({
          username: email.trim(),
          password,
        });
      } catch {
        // In case auto-sign-in fails, guide to login
      }

      registerModal.onClose();
      window.location.reload();
    } catch (err: any) {
      console.error("Confirmation error:", err);
      toast.error(err.message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  }, [email, password, confirmationCode, registerModal]);

  const handleResendCode = useCallback(async () => {
    try {
      await resendSignUpCode({ username: email.trim() });
      toast.success("New verification code sent to your email!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend code.");
    }
  }, [email]);

  let bodyContent = (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Create your KalRent Account
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Join the verified student housing & BaaS escrow rental community.
        </p>
      </div>

      <div className="space-y-3 pt-1">
        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole("tenant")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                role === "tenant"
                  ? "border-rose-500 bg-rose-50/80 text-rose-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Student Tenant
            </button>
            <button
              type="button"
              onClick={() => setRole("manager")}
              className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                role === "manager"
                  ? "border-rose-500 bg-rose-50/80 text-rose-700"
                  : "border-slate-200 text-slate-600 hover:border-slate-400"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Hostel Manager
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Richard Princewill"
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="email"
              placeholder="student@unilorin.edu.ng"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            Phone Number
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              placeholder="08088203832"
              disabled={isLoading}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              type="password"
              placeholder="At least 8 chars with symbols"
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (step === STEPS.CONFIRM) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Verify Your Email
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            We sent a 6-digit confirmation code to{" "}
            <span className="font-semibold text-slate-800">{email}</span>.
          </p>
        </div>

        <div className="pt-2">
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">
            Confirmation Code
          </label>
          <div className="relative">
            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              disabled={isLoading}
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
          <button
            type="button"
            onClick={handleResendCode}
            className="text-xs text-rose-500 hover:underline font-semibold mt-2.5 block cursor-pointer"
          >
            Didn&apos;t receive code? Resend
          </button>
        </div>
      </div>
    );
  }

  const footerContent = (
    <div className="flex flex-col gap-3 mt-2 text-center">
      <div className="text-xs text-slate-500">
        Already have a KalRent account?{" "}
        <button
          type="button"
          onClick={onToggle}
          className="text-rose-500 hover:underline font-semibold cursor-pointer"
        >
          Log in
        </button>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title={step === STEPS.FORM ? "Register" : "Verify Email"}
      actionLabel={
        isLoading
          ? "Processing..."
          : step === STEPS.FORM
          ? "Create Account"
          : "Confirm & Sign In"
      }
      onClose={registerModal.onClose}
      onSubmit={step === STEPS.FORM ? handleSignUp : handleConfirmCode}
      secondaryAction={step === STEPS.CONFIRM ? () => setStep(STEPS.FORM) : undefined}
      secondaryActionLabel={step === STEPS.CONFIRM ? "Back" : undefined}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default RegisterModal;
