"use client";

import { useState, useMemo } from "react";
import Calendar, { Range } from "@/components/inputs/Calendar";
import { ShieldCheck, CalendarRange, Info } from "lucide-react";
import { addYears } from "date-fns";

interface ListingReservationProps {
  annualRent: number;
  agentFee?: number;
  cautionDeposit?: number;
  platformFee?: number;
  totalPrice?: number;
  onChangeDate: (value: Range) => void;
  dateRange: Range;
  onSubmit: () => void;
  disabled?: boolean;
  disabledDates?: Date[];
}

export const ListingReservation: React.FC<ListingReservationProps> = ({
  annualRent,
  agentFee = 0,
  cautionDeposit = 0,
  platformFee = 0,
  onChangeDate,
  dateRange,
  onSubmit,
  disabled,
  disabledDates = [],
}) => {
  const [showCalendar, setShowCalendar] = useState(false);

  const calculatedPlatformFee = platformFee || Math.round(annualRent * 0.05);
  const calculatedAgentFee = Math.min(agentFee || Math.round(annualRent * 0.1), Math.round(annualRent * 0.1));
  const calculatedCautionDeposit = cautionDeposit || 50000;

  const totalUpfront =
    annualRent +
    calculatedAgentFee +
    calculatedCautionDeposit +
    calculatedPlatformFee;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-lg flex flex-col gap-4">
      {/* Price Header */}
      <div className="flex flex-row items-baseline justify-between">
        <div className="flex flex-row items-baseline gap-1">
          <div className="text-2xl font-extrabold text-slate-900">
            ₦{annualRent?.toLocaleString()}
          </div>
          <div className="font-light text-slate-500 text-xs">/ year</div>
        </div>

        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          <ShieldCheck className="w-3 h-3" />
          Escrow Custody
        </span>
      </div>

      <hr className="border-slate-100" />

      {/* Date Picker Button / Dropdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span>Tenancy Period</span>
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>{showCalendar ? "Collapse" : "Change Dates"}</span>
          </button>
        </div>

        <div
          onClick={() => setShowCalendar(!showCalendar)}
          className="p-3 border border-slate-200 rounded-xl text-xs flex items-center justify-between cursor-pointer hover:border-slate-400 transition"
        >
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Move-In</span>
            <span className="font-semibold text-slate-800">
              {dateRange.startDate ? dateRange.startDate.toLocaleDateString() : "Select Date"}
            </span>
          </div>
          <div className="text-slate-300">→</div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Move-Out</span>
            <span className="font-semibold text-slate-800">
              {dateRange.endDate ? dateRange.endDate.toLocaleDateString() : "Select Date"}
            </span>
          </div>
        </div>

        {showCalendar && (
          <div className="pt-2">
            <Calendar
              value={dateRange}
              disabledDates={disabledDates}
              onChange={(value) => onChangeDate(value)}
            />
          </div>
        )}
      </div>

      <hr className="border-slate-100" />

      {/* Upfront Financial Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
          Financial Breakdown (Statutory Schedule)
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Annual Rent</span>
          <span>₦{annualRent.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1">
            Agent Commission (Capped 10%)
            <Info className="w-3 h-3 text-slate-400" />
          </span>
          <span>₦{calculatedAgentFee.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span className="flex items-center gap-1">
            Caution Deposit (Held in Escrow)
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
          </span>
          <span>₦{calculatedCautionDeposit.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-slate-600">
          <span>Platform Fee (5%)</span>
          <span>₦{calculatedPlatformFee.toLocaleString()}</span>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Total Amount */}
      <div className="flex flex-row items-center justify-between font-extrabold text-sm text-slate-900">
        <div>Total Upfront Lock</div>
        <div className="text-base text-rose-600">₦{totalUpfront.toLocaleString()}</div>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="
          w-full 
          py-3 
          rounded-xl 
          bg-rose-500 
          hover:bg-rose-600 
          text-white 
          font-bold 
          text-sm 
          transition 
          shadow-sm 
          hover:shadow-md 
          cursor-pointer 
          disabled:opacity-50 
          disabled:cursor-not-allowed
        "
      >
        Apply & Reserve Now
      </button>

      <div className="text-[10px] text-slate-400 text-center leading-relaxed">
        Protected under Kwara State Tenancy Laws & BaaS Escrow Trust.
      </div>
    </div>
  );
};

export default ListingReservation;
