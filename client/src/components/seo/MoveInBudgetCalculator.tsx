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
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-6 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10 text-primary">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-foreground">
              Total Estimated Move-in Budget
            </h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Upfront cost breakdown for a {propertyTypeName.toLowerCase()} in {locationName}.
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <span>KalRent Escrow Shield Active</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
        {/* Left: Input controls */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-foreground">
                Annual Rent (₦)
              </label>
              <span className="text-sm font-bold text-foreground">
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
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Caution ({cautionPercent}%)
              </label>
              <select
                value={cautionPercent}
                onChange={(e) => setCautionPercent(Number(e.target.value))}
                className="w-full text-xs font-medium border border-border rounded-lg px-2.5 py-2 bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={0}>0% (Waived)</option>
                <option value={5}>5%</option>
                <option value={10}>10% (Standard)</option>
                <option value={15}>15%</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Agreement ({legalPercent}%)
              </label>
              <select
                value={legalPercent}
                onChange={(e) => setLegalPercent(Number(e.target.value))}
                className="w-full text-xs font-medium border border-border rounded-lg px-2.5 py-2 bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={5}>5%</option>
                <option value={10}>10% (Standard)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground block mb-1">
                Agency ({agencyPercent}%)
              </label>
              <select
                value={agencyPercent}
                onChange={(e) => setAgencyPercent(Number(e.target.value))}
                className="w-full text-xs font-medium border border-border rounded-lg px-2.5 py-2 bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value={5}>5%</option>
                <option value={10}>10% (Standard)</option>
              </select>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-xl border border-border">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p>
              In Nigeria, landlords standardly require 1-year upfront rent, refundable caution deposit (10%), legal tenancy documentation fee (10%), and agency commission (10%).
            </p>
          </div>
        </div>

        {/* Right: Calculated breakdown summary */}
        <div className="lg:col-span-6 bg-muted/40 rounded-xl p-5 border border-border flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Base Annual Rent</span>
              <span className="font-semibold text-foreground">{formatNaira(rent)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Refundable Caution Deposit ({cautionPercent}%)</span>
              <span className="font-semibold text-foreground">{formatNaira(cautionAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Legal & Tenancy Agreement ({legalPercent}%)</span>
              <span className="font-semibold text-foreground">{formatNaira(legalAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Verified Agency Commission ({agencyPercent}%)</span>
              <span className="font-semibold text-foreground">{formatNaira(agencyAmount)}</span>
            </div>

            <div className="flex justify-between items-center text-sm text-primary font-medium pt-1">
              <span>KalRent Escrow Protection</span>
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-bold">100% INCLUDED (FREE)</span>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-border flex justify-between items-baseline">
            <div>
              <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                Total Upfront Move-In Cost
              </span>
              <div className="text-2xl font-black text-primary">
                {formatNaira(totalMoveIn)}
              </div>
            </div>
            <a
              href="#listings-feed"
              className="inline-flex items-center px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition font-semibold text-xs shadow-sm"
            >
              Browse Verified Homes
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
