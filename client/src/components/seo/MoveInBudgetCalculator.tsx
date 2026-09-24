"use client";

import React, { useState } from "react";
import { formatNaira } from "@/lib/seo/data";
import { Calculator, ShieldCheck, Info } from "lucide-react";

interface MoveInBudgetCalculatorProps {
  initialRent: number;
  locationName: string;
  propertyTypeName: string;
}

export default function MoveInBudgetCalculator({
  initialRent,
  locationName,
  propertyTypeName,
}: MoveInBudgetCalculatorProps) {
  const [rent, setRent] = useState<number>(initialRent);
  const [cautionPercent, setCautionPercent] = useState<number>(10);
  const [legalPercent, setLegalPercent] = useState<number>(10);
  const [agencyPercent, setAgencyPercent] = useState<number>(10);

  const cautionAmount = Math.round(rent * (cautionPercent / 100));
  const legalAmount = Math.round(rent * (legalPercent / 100));
  const agencyAmount = Math.round(rent * (agencyPercent / 100));
  const totalMoveIn = rent + cautionAmount + legalAmount + agencyAmount;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">
              Total Estimated Move-in Budget
            </h3>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Upfront cost breakdown for a {propertyTypeName.toLowerCase()} in {locationName}.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>KalRent Escrow Shield Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left: Input controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-neutral-800">
                Annual Rent (₦)
              </label>
              <span className="text-sm font-bold text-neutral-900">
                {formatNaira(rent)}
              </span>
            </div>
            <input
              type="range"
              min={Math.round(initialRent * 0.3)}
              max={Math.round(initialRent * 2.5)}
              step={50000}
              value={rent}
              onChange={(e) => setRent(Number(e.target.value))}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">
                Caution ({cautionPercent}%)
              </label>
              <select
                value={cautionPercent}
                onChange={(e) => setCautionPercent(Number(e.target.value))}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg px-2.5 py-2 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={0}>0% (Waived)</option>
                <option value={5}>5%</option>
                <option value={10}>10% (Standard)</option>
                <option value={15}>15%</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">
                Agreement ({legalPercent}%)
              </label>
              <select
                value={legalPercent}
                onChange={(e) => setLegalPercent(Number(e.target.value))}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg px-2.5 py-2 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={5}>5%</option>
                <option value={10}>10% (Standard)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-600 block mb-1">
                Agency ({agencyPercent}%)
              </label>
              <select
                value={agencyPercent}
                onChange={(e) => setAgencyPercent(Number(e.target.value))}
                className="w-full text-xs font-medium border border-neutral-200 rounded-lg px-2.5 py-2 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value={5}>5%</option>
                <option value={10}>10% (Standard)</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
            <Info className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
            <p>
              In Nigeria, landlords standardly require 1-year upfront rent, refundable caution deposit (10%), legal tenancy documentation fee (10%), and agency commission (10%).
            </p>
          </div>
        </div>

        {/* Right: Calculated breakdown summary */}
        <div className="lg:col-span-6 bg-neutral-50/80 rounded-xl p-5 border border-neutral-200/60 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">Base Annual Rent</span>
              <span className="font-semibold text-neutral-900">{formatNaira(rent)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">Refundable Caution Deposit ({cautionPercent}%)</span>
              <span className="font-semibold text-neutral-900">{formatNaira(cautionAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">Legal & Tenancy Agreement ({legalPercent}%)</span>
              <span className="font-semibold text-neutral-900">{formatNaira(legalAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-neutral-600">Verified Agency Commission ({agencyPercent}%)</span>
              <span className="font-semibold text-neutral-900">{formatNaira(agencyAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-sm text-emerald-700 font-medium pt-1">
              <span>KalRent Escrow Protection</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100/70 text-xs font-bold">100% INCLUDED (FREE)</span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-neutral-200 flex justify-between items-baseline">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-neutral-500">
                Total Upfront Move-In Cost
              </span>
              <div className="text-2xl font-black text-emerald-800">
                {formatNaira(totalMoveIn)}
              </div>
            </div>
            <a
              href="#listings-feed"
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 transition font-semibold text-xs shadow-sm"
            >
              Browse Verified Homes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
