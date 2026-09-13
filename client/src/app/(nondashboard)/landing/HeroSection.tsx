"use client";

import Image from "next/image";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setFilters } from "@/state";
import { Compass, MapPin, Search, ShieldCheck } from "lucide-react";

const CAMPUS_ZONES = [
  { name: "Tanke", query: "Tanke" },
  { name: "Sanrab", query: "Sanrab" },
  { name: "Oke-Odo", query: "OkeOdo" },
  { name: "Jalala", query: "Jalala" },
  { name: "Mark Junction", query: "MarkJunction" },
];

const HeroSection = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleLocationSearch = async (overrideQuery?: string) => {
    try {
      const queryToUse = (overrideQuery ?? searchQuery).trim();
      if (!queryToUse) {
        router.push("/search");
        return;
      }

      dispatch(
        setFilters({
          location: queryToUse,
        })
      );
      router.push(`/search?location=${encodeURIComponent(queryToUse)}`);
    } catch (error) {
      console.error("Error searching location:", error);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center pt-16">
      <Image
        src="/landing-splash.jpg"
        alt="KalRent Student Housing Platform Hero Section"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 text-center w-full max-w-4xl mx-auto px-4 sm:px-8 py-16"
      >
        {/* Trust Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold mb-6 shadow-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Statutory Escrow-Protected Student Housing in Ilorin</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15] mb-5">
          Find Your Perfect Campus Hostel &amp; Home
        </h1>
        <p className="text-base sm:text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Verified student accommodations, 10% capped agent commission, and caution deposits quarantined safely in BaaS escrow.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto bg-white/95 p-2 rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md flex flex-col sm:flex-row items-center gap-2">
          <div className="relative w-full flex items-center pl-3">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mr-2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
              placeholder="Search by campus zone, landmark or street (e.g. Tanke)"
              className="w-full border-none shadow-none focus-visible:ring-0 text-slate-800 placeholder:text-slate-400 text-sm h-11 bg-transparent"
            />
          </div>
          <Button
            onClick={() => handleLocationSearch()}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-7 h-11 transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Search Hostels</span>
          </Button>
        </div>

        {/* Campus Zone Quick Chips */}
        <div className="mt-6 flex items-center justify-center gap-2 flex-wrap text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium mr-1">
            <Compass className="w-3.5 h-3.5 text-slate-400" />
            Popular Zones:
          </span>
          {CAMPUS_ZONES.map((zone) => (
            <button
              key={zone.name}
              onClick={() => handleLocationSearch(zone.query)}
              className="px-3 py-1 rounded-full bg-slate-900/70 border border-slate-700 text-slate-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all font-medium cursor-pointer shadow-xs"
            >
              {zone.name}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
