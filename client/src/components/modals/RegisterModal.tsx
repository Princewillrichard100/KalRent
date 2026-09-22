"use client";

import { useState, useCallback } from "react";
import { signUp, confirmSignUp, resendSignUpCode, signIn } from "aws-amplify/auth";
import { toast } from 'react-hot-toast';
import { useRegisterModal } from "@/hooks/useRegisterModal";
import { useLoginModal } from "@/hooks/useLoginModal";
import Modal from "./Modal";
import Heading from "@/components/Heading";
import Input from "@/components/inputs/Input";

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

      try {
        await signIn({
          username: email.trim(),
          password,
        });
      } catch {
        // In case auto-sign-in fails
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
      <Heading
        title="Welcome to Airbnb"
        subtitle="Create an account!"
      />
      <div className="flex flex-row gap-3 py-1">
        <button
          type="button"
          onClick={() => setRole("tenant")}
          className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-semibold transition ${
            role === "tenant" ? "border-black bg-neutral-100" : "border-neutral-200"
          }`}
        >
          Student / Tenant
        </button>
        <button
          type="button"
          onClick={() => setRole("manager")}
          className={`flex-1 py-2 px-3 rounded-lg border-2 text-xs font-semibold transition ${
            role === "manager" ? "border-black bg-neutral-100" : "border-neutral-200"
          }`}
        >
          Host / Manager
        </button>
      </div>
      <Input
        id="name"
        label="Name"
        disabled={isLoading}
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        id="email"
        label="Email"
        type="email"
        disabled={isLoading}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        id="phoneNumber"
        label="Phone Number"
        type="tel"
        disabled={isLoading}
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        disabled={isLoading}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>
  );

  if (step === STEPS.CONFIRM) {
    bodyContent = (
      <div className="flex flex-col gap-4">
        <Heading
          title="Verify your email"
          subtitle={`We sent a code to ${email}`}
        />
        <Input
          id="confirmationCode"
          label="6-Digit Confirmation Code"
          disabled={isLoading}
          value={confirmationCode}
          onChange={(e) => setConfirmationCode(e.target.value)}
          required
        />
        <div 
          onClick={handleResendCode}
          className="text-neutral-500 text-xs hover:underline cursor-pointer"
        >
          Didn&apos;t receive code? Resend
        </div>
      </div>
    );
  }

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr />
      <div 
        className="
          text-neutral-500 
          text-center 
          mt-4 
          font-light
        "
      >
        <p>Already have an account?
          <span 
            onClick={onToggle} 
            className="
              text-neutral-800
              cursor-pointer 
              hover:underline
              ml-1
            "
            > Log in</span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={registerModal.isOpen}
      title="Register"
      actionLabel={step === STEPS.FORM ? "Continue" : "Confirm & Sign In"}
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
