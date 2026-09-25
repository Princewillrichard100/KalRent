import React from "react";
import Navbar from "@/components/Navbar";
import FooterSection from "@/app/(nondashboard)/landing/FooterSection";
import { NAVBAR_HEIGHT } from "@/lib/constants";

export default function PropertyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />
      <main
        className="flex-1 w-full"
        style={{ paddingTop: `${NAVBAR_HEIGHT}px` }}
      >
        {children}
      </main>
      <FooterSection />
    </div>
  );
}
