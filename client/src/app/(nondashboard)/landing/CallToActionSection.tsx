"use client";

import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

const CallToActionSection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      <Image
        src="/landing-call-to-action.jpg"
        alt="KalRent Campus Housing CTA"
        fill
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"></div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative max-w-5xl mx-auto px-4 sm:px-8 py-10"
      >
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-slate-900/60 p-8 sm:p-10 rounded-3xl border border-slate-700/60 shadow-2xl backdrop-blur-md">
          <div className="space-y-3 max-w-lg text-center md:text-left">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Ready for your next stay or move?
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Lock in Your Verified Nigerian Stay Today
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Explore properties across Lagos, Abuja, Port Harcourt, and nationwide with KalRent Cover security and zero hidden fees.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 text-slate-900 bg-white rounded-xl px-5 py-3 text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-600" />
              <span>Browse All Listings</span>
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 text-white bg-emerald-600 rounded-xl px-5 py-3 text-xs font-bold hover:bg-emerald-500 transition-colors shadow-md cursor-pointer group"
              scroll={false}
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default CallToActionSection;
