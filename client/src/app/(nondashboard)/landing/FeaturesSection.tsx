"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Scale, MapPin, ArrowRight } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const FeaturesSection = () => {
  const features = [
    {
      icon: ShieldCheck,
      badge: "Financial Security",
      title: "KalRent Cover Protected Stays",
      description:
        "Your caution deposit is kept safe and refunded promptly upon checkout clearance with 24/7 guest support.",
      linkText: "Browse Protected Stays",
      linkHref: "/search",
    },
    {
      icon: Scale,
      badge: "Zero Exploitation",
      title: "Capped & Transparent Fees",
      description:
        "Clear pricing with maximum 10% agent commission. No hidden checkout surcharges, unexpected finder fees, or surprise costs.",
      linkText: "View Transparent Pricing",
      linkHref: "/search?sortBy=annualRent",
    },
    {
      icon: MapPin,
      badge: "Prime Locations",
      title: "Verified Nigerian Properties",
      description:
        "Every accommodation is physically inspected and tagged with live GPS coordinates across Lagos, Abuja, Port Harcourt, and beyond.",
      linkText: "Explore Neighborhoods",
      linkHref: "/search",
    },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
      className="py-24 px-4 sm:px-8 bg-slate-50 border-t border-slate-100"
    >
      <div className="max-w-6xl mx-auto">
        <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-200">
            Why KalRent
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Designed for Safe &amp; Regulated Campus Living
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Eliminating hostel fraud, exorbitant agent charges, and unreturned caution deposits across Kwara State tertiary institutions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-5 shadow-2xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    {feature.badge}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>
                </div>

                <Link
                  href={feature.linkHref}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors mt-auto group"
                  scroll={false}
                >
                  <span>{feature.linkText}</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
};

export default FeaturesSection;
