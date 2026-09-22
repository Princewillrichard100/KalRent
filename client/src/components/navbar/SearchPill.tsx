"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useSearchModal } from "@/hooks/useSearchModal";
import { differenceInDays } from "date-fns";

export const SearchPill = () => {
  const searchModal = useSearchModal();
  const params = useSearchParams();

  const location = params?.get("location") || params?.get("locationValue") || params?.get("campusZone");
  const startDate = params?.get("startDate");
  const endDate = params?.get("endDate");
  const guestCount = params?.get("guestCount") || params?.get("beds");

  const locationLabel = useMemo(() => {
    if (location) {
      return location;
    }
    return "Anywhere in Nigeria";
  }, [location]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = differenceInDays(end, start);
      return `${diff} ${diff === 1 ? "Night" : "Nights"}`;
    }
    return "Any Week";
  }, [startDate, endDate]);

  const guestsLabel = useMemo(() => {
    if (guestCount) {
      return `${guestCount} ${Number(guestCount) === 1 ? "Guest" : "Guests"}`;
    }
    return "Add Guests";
  }, [guestCount]);

  return (
    <div
      onClick={searchModal.onOpen}
      className="
        border 
        border-slate-200 
        w-full 
        md:w-auto 
        py-2 
        rounded-full 
        shadow-xs 
        hover:shadow-md 
        transition 
        cursor-pointer
        bg-white
      "
    >
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-semibold px-4 text-neutral-900 truncate max-w-[160px]">
          {locationLabel}
        </div>
        <div className="hidden sm:block text-sm font-semibold px-4 border-x border-neutral-200 flex-1 text-center text-neutral-800">
          {durationLabel}
        </div>
        <div className="text-sm pl-4 pr-2 text-neutral-500 flex flex-row items-center gap-3">
          <div className="hidden sm:block text-neutral-500 font-normal">{guestsLabel}</div>
          <div className="p-2.5 bg-rose-500 rounded-full text-white shadow-xs">
            <Search className="w-4 h-4" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPill;
