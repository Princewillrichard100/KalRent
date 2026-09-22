"use client";

import { useEffect, useState } from "react";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import SearchModal from "./SearchModal";
import RentModal from "./RentModal";

export const ModalsProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <LoginModal />
      <RegisterModal />
      <SearchModal />
      <RentModal />
    </>
  );
};

export default ModalsProvider;
