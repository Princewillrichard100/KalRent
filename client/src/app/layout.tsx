import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ToasterProvider from "@/providers/ToasterProvider";
import ModalsProvider from "@/components/modals/ModalsProvider";

import RootJsonLd from "@/components/seo/schema/RootJsonLd";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kalrent.com.ng"),
  title: {
    default: "KalRent | Verified Houses, Flats & Apartments for Rent in Nigeria",
    template: "%s | KalRent",
  },
  description:
    "Find verified rental homes, serviced flats, and apartments across Nigeria with KalRent Cover protection. Zero ghost listings, protected escrow.",
  alternates: {
    canonical: "https://kalrent.com.ng",
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://kalrent.com.ng",
    siteName: "KalRent",
    title: "KalRent | Verified Houses, Flats & Apartments for Rent in Nigeria",
    description:
      "Find verified rental homes, serviced flats, and apartments across Nigeria with KalRent Cover protection. Zero ghost listings, protected escrow.",
    images: [
      {
        url: "https://kalrent.com.ng/api/og?title=Verified+Rental+Homes+in+Nigeria",
        width: 1200,
        height: 630,
        alt: "KalRent Nigeria Real Estate Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "KalRent | Verified Houses, Flats & Apartments for Rent in Nigeria",
    description:
      "Find verified rental homes across Nigeria with KalRent Cover protection. Zero ghost listings.",
    creator: "@kalrentng",
    images: ["https://kalrent.com.ng/api/og?title=Verified+Rental+Homes+in+Nigeria"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={outfit.variable}>
      <head>
        <RootJsonLd />
      </head>
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
