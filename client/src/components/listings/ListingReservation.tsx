"use client";

import { useState } from "react";
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

  const calculatedCleaningFee = agentFee || Math.round(annualRent * 0.05);
  const calculatedServiceFee = platformFee || Math.round(annualRent * 0.05);
  const calculatedCautionDeposit = cautionDeposit || Math.round(annualRent * 0.1);

  const total =
    annualRent +
    calculatedCleaningFee +
    calculatedServiceFee +
    calculatedCautionDeposit;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-xl flex flex-col gap-4 sticky top-28">
      {/* Price Header */}
      <div className="flex flex-row items-baseline justify-between">
        <div className="flex flex-row items-baseline gap-1">
          <span className="text-2xl font-bold text-neutral-900">
            ₦{annualRent?.toLocaleString()}
          </span>
          <span className="font-light text-neutral-500 text-sm">/ year</span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          Protected Booking
        </span>
      </div>

      <hr className="border-neutral-100" />

      {/* Date Picker Button / Dropdown */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
          <span>Dates</span>
          <button
            type="button"
            onClick={() => setShowCalendar(!showCalendar)}
            className="text-rose-500 hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <CalendarRange className="w-3.5 h-3.5" />
            <span>{showCalendar ? "Close" : "Change Dates"}</span>
          </button>
        </div>

        <div
          onClick={() => setShowCalendar(!showCalendar)}
          className="p-3 border border-neutral-300 rounded-xl text-xs flex items-center justify-between cursor-pointer hover:border-black transition"
        >
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Check-in</span>
            <span className="font-semibold text-neutral-800">
              {dateRange.startDate ? dateRange.startDate.toLocaleDateString() : "Select Date"}
            </span>
          </div>
          <div className="text-neutral-300 font-bold">→</div>
          <div>
            <span className="text-neutral-400 block text-[10px] uppercase font-bold">Checkout</span>
            <span className="font-semibold text-neutral-800">
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
          bg-rose-500 
          hover:bg-rose-600 
          text-white 
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

      <div className="text-xs text-neutral-500 text-center">
        You won&apos;t be charged yet
      </div>

      <hr className="border-neutral-100" />

      {/* Financial Breakdown */}
      <div className="space-y-3 text-sm">
        <div className="flex justify-between text-neutral-600">
          <span className="underline">Base rent</span>
          <span>₦{annualRent.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-neutral-600">
          <span className="underline">Cleaning fee</span>
          <span>₦{calculatedCleaningFee.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-neutral-600">
          <span className="underline">Service fee</span>
          <span>₦{calculatedServiceFee.toLocaleString()}</span>
        </div>

        <div className="flex justify-between text-neutral-600">
          <span className="underline">Refundable caution deposit</span>
          <span>₦{calculatedCautionDeposit.toLocaleString()}</span>
        </div>
      </div>

      <hr className="border-neutral-200" />

      {/* Total Amount */}
      <div className="flex flex-row items-center justify-between font-bold text-base text-neutral-900">
        <div>Total before taxes</div>
        <div className="text-lg text-neutral-900">₦{total.toLocaleString()}</div>
      </div>

      <p className="text-[11px] text-neutral-400 text-center leading-normal mt-1">
        Caution deposit is fully refundable to you upon checkout.
      </p>
    </div>
  );
};

export default ListingReservation;
