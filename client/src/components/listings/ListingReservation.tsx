"use client";

import React, { useState, useMemo } from "react";
import Calendar, { Range } from "@/components/inputs/Calendar";
import { ShieldCheck, CalendarRange } from "lucide-react";

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

  const durationDays = useMemo(() => {
    if (!dateRange.startDate || !dateRange.endDate) return 365;
    const diffTime = dateRange.endDate.getTime() - dateRange.startDate.getTime();
    const days = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 365;
  }, [dateRange.startDate, dateRange.endDate]);

  const effectiveBaseRent = useMemo(() => {
    if (durationDays === 365) return annualRent;
    return Math.round((annualRent / 365) * durationDays);
  }, [annualRent, durationDays]);

  const calculatedCleaningFee = agentFee || Math.round(effectiveBaseRent * 0.05);
  const calculatedServiceFee = platformFee || Math.round(effectiveBaseRent * 0.05);
  const calculatedCautionDeposit = cautionDeposit || Math.round(effectiveBaseRent * 0.1);

  const total =
    effectiveBaseRent +
    calculatedCleaningFee +
    calculatedServiceFee +
    calculatedCautionDeposit;

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-xl flex flex-col gap-4 sticky top-28 text-card-foreground">
      {/* Price Header */}
      <div className="flex flex-row items-baseline justify-between">
        <div className="flex flex-row items-baseline gap-1">
          <span className="text-2xl font-bold text-foreground">
            ₦{annualRent?.toLocaleString()}
          </span>
          <span className="font-light text-muted-foreground text-sm">/ year</span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Protected Booking
        </span>
      </div>

      <hr className="border-border" />

      {/* Date Picker Button / Dropdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span>Dates</span>
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-primary hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>{showCalendar ? "Close" : "Change Dates"}</span>
          </button>
        </div>

        <div
          onClick={() => setShowCalendar(!showCalendar)}
          className="p-3 border border-border rounded-xl text-xs flex items-center justify-between cursor-pointer hover:border-primary/50 bg-muted/40 transition"
        >
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Check-in</span>
            <span className="font-semibold text-foreground">
              {dateRange.startDate ? dateRange.startDate.toLocaleDateString() : "Select Date"}
            </span>
          </div>
          <div className="text-muted-foreground font-bold">→</div>
          <div>
            <span className="text-muted-foreground block text-[10px] uppercase font-bold">Checkout</span>
            <span className="font-semibold text-foreground">
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

      {/* Submit Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={onSubmit}
        className="
          w-full 
          py-3.5 
          rounded-xl 
          bg-primary 
          hover:bg-primary/90 
          text-primary-foreground 
          font-bold 
          text-base 
          transition 
          shadow-md 
          hover:shadow-lg 
          cursor-pointer 
          disabled:opacity-50 
          disabled:cursor-not-allowed
        "
      >
        Reserve
      </button>

      <div className="text-xs text-muted-foreground text-center">
        You won&apos;t be charged yet
      </div>

      <hr className="border-border" />

      {/* Financial Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span className="underline">
            Base rent {durationDays !== 365 ? `(${durationDays} days)` : "(1 year)"}
          </span>
          <span className="text-foreground font-medium">₦{effectiveBaseRent.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span className="underline">Cleaning fee</span>
          <span className="text-foreground font-medium">₦{calculatedCleaningFee.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span className="underline">Service fee</span>
          <span className="text-foreground font-medium">₦{calculatedServiceFee.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-muted-foreground">
          <span className="underline">Refundable caution deposit</span>
          <span className="text-foreground font-medium">₦{calculatedCautionDeposit.toLocaleString()}</span>
        </div>
      </div>

      <hr className="border-border" />

      {/* Total Amount */}
      <div className="flex flex-row items-center justify-between font-bold text-base text-foreground">
        <div>Total before taxes</div>
        <div className="text-lg text-foreground">₦{total.toLocaleString()}</div>
      </div>

      <p className="text-[11px] text-muted-foreground text-center leading-normal mt-1">
        Caution deposit is fully refundable to you upon checkout.
      </p>
    </div>
  );
};

export default ListingReservation;
