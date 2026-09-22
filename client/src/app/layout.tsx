import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ToasterProvider from "@/providers/ToasterProvider";
import ModalsProvider from "@/components/modals/ModalsProvider";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KalRent | Campus Rental & Escrow Platform",
  description: "Secure student accommodation rentals and escrow payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <body
        className="font-sans antialiased text-slate-900 bg-slate-50 [text-rendering:optimizeLegibility] min-h-screen"
      >
        <Providers>
          <ToasterProvider />
          <ModalsProvider />
          {children}
        </Providers>
      </body>
    </html>
  );
}
