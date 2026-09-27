"use client";

import { useState, useCallback, useEffect } from "react";
import { signIn } from "aws-amplify/auth";
import { toast } from "react-hot-toast";
import { AlertCircle } from "lucide-react";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useRegisterModal } from "@/hooks/useRegisterModal";
import Modal from "./Modal";
import Heading from "@/components/Heading";
import Input from "@/components/inputs/Input";

const getAuthErrorMessage = (err: any): string => {
  const name = err?.name || err?.code || "";
  const message = err?.message || "";

  if (
    name === "NotAuthorizedException" ||
    message.toLowerCase().includes("incorrect username or password")
  ) {
    return "Incorrect email or password. Please verify your credentials and try again.";
  }
  if (name === "UserNotFoundException") {
    return "No KalRent account found with this email. Please create an account.";
  }
  if (name === "UserNotConfirmedException") {
    return "Your account is not verified yet. Please check your email for the confirmation code.";
  }
  if (name === "LimitExceededException") {
    return "Too many sign-in attempts. Please wait a few moments before trying again.";
  }
  if (name === "InvalidParameterException") {
    return "Please provide a valid email address and password.";
  }
  return message || "Failed to sign in. Please try again.";
};

export const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clear errors when modal opens or closes
  useEffect(() => {
    if (!loginModal.isOpen) {
      setErrorMessage(null);
    }
  }, [loginModal.isOpen]);

  const onToggle = useCallback(() => {
    setErrorMessage(null);
    loginModal.onClose();
    registerModal.onOpen();
  }, [loginModal, registerModal]);

  const handleInputChange = (setter: (v: string) => void) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (errorMessage) setErrorMessage(null);
    setter(e.target.value);
  };

  const onSubmit = useCallback(async () => {
    setErrorMessage(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      const msg = "Please enter both your email address and password.";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      const { isSignedIn, nextStep } = await signIn({
        username: cleanEmail,
        password,
      });

      if (isSignedIn) {
        toast.success("Signed in successfully!");
        loginModal.onClose();
        window.location.reload();
      } else if (nextStep.signInStep === "CONFIRM_SIGN_UP") {
        toast("Account not verified yet. Please check your email for the code.");
        loginModal.onClose();
        registerModal.onOpen();
      } else {
        toast(`Next step: ${nextStep.signInStep}`);
      }
    } catch (err: any) {
      // Use console.warn for expected auth rejection to prevent Next.js dev error overlay
      console.warn("Sign in rejection:", err?.name, err?.message);
      const friendlyMessage = getAuthErrorMessage(err);
      setErrorMessage(friendlyMessage);
      toast.error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, loginModal, registerModal]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      e.preventDefault();
      onSubmit();
    }
  };

  const bodyContent = (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-4"
    >
      <Heading
        title="Welcome back"
        subtitle="Login to your KalRent account"
      />

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5 animate-in fade-in-0 duration-200"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <Input
        id="email"
        label="Email address"
        type="email"
        disabled={isLoading}
        value={email}
        onChange={handleInputChange(setEmail)}
        errors={errorMessage ? { email: true } : undefined}
        required
      />
      <Input
        id="password"
        label="Password"
        type="password"
        disabled={isLoading}
        value={password}
        onChange={handleInputChange(setPassword)}
        errors={errorMessage ? { password: true } : undefined}
        required
      />
    </form>
  );

  const footerContent = (
    <div className="flex flex-col gap-4 mt-3">
      <hr className="border-border" />
      <div className="text-muted-foreground text-center mt-2 text-sm">
        <p>
          First time using KalRent?
          <button
            type="button"
            onClick={onToggle}
            className="text-primary font-semibold cursor-pointer hover:underline ml-1"
          >
            Create an account
          </button>
        </p>
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
