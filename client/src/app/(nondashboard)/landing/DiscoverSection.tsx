"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, FileCheck2, KeyRound } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const DiscoverSection = () => {
  const steps = [
    {
      icon: Compass,
      step: "01",
      title: "Discover & Verify",
      description:
        "Filter student accommodations by campus zone, inspect GPS distance to campus gates, and examine clear upfront fee schedules.",
    },
    {
      icon: FileCheck2,
      step: "02",
      title: "Reserve with KalRent Cover",
      description:
        "Submit your booking request. Payments and caution deposits are protected under KalRent Cover with instant reservation confirmation.",
    },
    {
      icon: KeyRound,
      step: "03",
      title: "Check In & Enjoy",
      description:
        "Complete your smooth check-in. When your stay concludes, checkout clearance triggers prompt caution deposit refund.",
    },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      variants={containerVariants}
      className="py-20 bg-white border-t border-slate-100"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Rent Confidently in Three Simple Steps
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            From discovering verified hostels to receiving your keys with legal protection.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-slate-50 border border-slate-200/80 rounded-2xl p-8 text-left relative overflow-hidden group hover:border-emerald-300 hover:shadow-md transition-all duration-200"
              >
                <div className="absolute top-4 right-4 text-3xl font-black text-slate-200 group-hover:text-emerald-100 transition-colors">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 text-emerald-600 shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default DiscoverSection;
