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
              The regulated student housing platform for University of Ilorin and Kwara State campuses. Verified listings, capped 10% agent commission, and BaaS-secured caution deposit escrow.
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>BaaS Escrow Trust Guarantee</span>
            </div>
          </div>

          {/* Campus Zones */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Campus Zones
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/search?location=Tanke" className="hover:text-emerald-400 transition-colors">
                  Tanke & University Road
                </Link>
              </li>
              <li>
                <Link href="/search?location=Sanrab" className="hover:text-emerald-400 transition-colors">
                  Sanrab Student Area
                </Link>
              </li>
              <li>
                <Link href="/search?location=OkeOdo" className="hover:text-emerald-400 transition-colors">
                  Oke-Odo & Mini Campus
                </Link>
              </li>
              <li>
                <Link href="/search?location=Jalala" className="hover:text-emerald-400 transition-colors">
                  Jalala & Senior Staff Quarters
                </Link>
              </li>
              <li>
                <Link href="/search?location=MarkJunction" className="hover:text-emerald-400 transition-colors">
                  Mark Junction
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Standards */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
              Statutory Trust
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                <span>Evidence Act (2011) Valid</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>Kwara Tenancy Law Cap 10%</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>GPS Distance Proximity</span>
              </li>
              <li>
                <Link href="/search" className="hover:text-emerald-400 transition-colors">
                  Find Verified Hostels
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} KalRent Technologies. All rights reserved. Registered campus tenancy engine.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Tenancy Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
