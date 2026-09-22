import Link from "next/link";
import React from "react";
import { Building2, ShieldCheck, Scale, Compass } from "lucide-react";

const FooterSection = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-400 py-16">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2" scroll={false}>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-xs">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                KAL<span className="text-emerald-400">RENT</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The modern rental and stay accommodation platform across Nigeria. Verified listings, transparent pricing, and KalRent Cover protection.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Protected Booking Guarantee</span>
            </div>
          </div>

          {/* Top Destinations */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Top Destinations
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search?location=Lekki" className="hover:text-emerald-400 transition-colors">
                  Lekki &amp; Victoria Island
                </Link>
              </li>
              <li>
                <Link href="/search?location=Maitama" className="hover:text-emerald-400 transition-colors">
                  Maitama &amp; Wuse 2, Abuja
                </Link>
              </li>
              <li>
                <Link href="/search?location=Ikeja" className="hover:text-emerald-400 transition-colors">
                  Ikeja &amp; Ikoyi, Lagos
                </Link>
              </li>
              <li>
                <Link href="/search?location=PortHarcourt" className="hover:text-emerald-400 transition-colors">
                  Port Harcourt, Rivers
                </Link>
              </li>
              <li>
                <Link href="/search?location=Ibadan" className="hover:text-emerald-400 transition-colors">
                  Ibadan, Oyo
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Trust &amp; Safety
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>KalRent Cover Protection</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-400" />
                <span>Transparent Capped Fees</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-400" />
                <span>Verified GPS Listings</span>
              </li>
              <li>
                <Link href="/search" className="hover:text-emerald-400 transition-colors">
                  Find Verified Stays
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} KalRent Technologies. All rights reserved. Built for secure stays across Nigeria.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Community Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
