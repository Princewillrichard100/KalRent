"use client";

import { useState, useCallback } from "react";
import { signIn } from "aws-amplify/auth";
import { toast } from 'react-hot-toast';
import { useLoginModal } from "@/hooks/useLoginModal";
import { useRegisterModal } from "@/hooks/useRegisterModal";
import Modal from "./Modal";
import Heading from "@/components/Heading";
import Input from "@/components/inputs/Input";

export const LoginModal = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        toast("Account not verified yet. Please check your email for the code.");
        loginModal.onClose();
        registerModal.onOpen();
      } else {
        toast(`Next step: ${nextStep.signInStep}`);
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
      <Heading
        title="Welcome back"
        subtitle="Login to your account!"
      />
      <Input
        id="email"
        label="Email"
        disabled={isLoading}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        <p>First time using Airbnb?
          <span 
            onClick={onToggle} 
            className="
              text-neutral-800
              cursor-pointer 
              hover:underline
              ml-1
            "
            > Create an account</span>
        </p>
      </div>
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={loginModal.isOpen}
      title="Login"
      actionLabel="Continue"
      onClose={loginModal.onClose}
      onSubmit={onSubmit}
      body={bodyContent}
      footer={footerContent}
    />
  );
};

export default LoginModal;
