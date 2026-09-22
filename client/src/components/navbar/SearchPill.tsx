"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { useSearchModal } from "@/hooks/useSearchModal";
import { differenceInDays } from "date-fns";

export const SearchPill = () => {
  const searchModal = useSearchModal();
  const params = useSearchParams();

  const campusZone = params?.get("campusZone");
  const startDate = params?.get("startDate");
  const endDate = params?.get("endDate");
  const beds = params?.get("beds");

  const locationLabel = useMemo(() => {
    if (campusZone) {
      return campusZone;
    }
    return "Any Campus Zone";
  }, [campusZone]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = differenceInDays(end, start);
      return `${diff} Days`;
    }
    return "Any Term";
  }, [startDate, endDate]);

  const bedsLabel = useMemo(() => {
    if (beds) {
      return `${beds} ${Number(beds) === 1 ? "Bed" : "Beds"}`;
    }
    return "Add Beds";
  }, [beds]);

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
        <div className="text-xs font-bold px-4 text-slate-800 truncate max-w-[130px]">
          {locationLabel}
        </div>
        <div className="hidden sm:block text-xs font-semibold px-4 border-x border-slate-200 flex-1 text-center text-slate-600">
          {durationLabel}
        </div>
        <div className="text-xs pl-4 pr-2 text-slate-500 flex flex-row items-center gap-3">
          <div className="hidden sm:block text-slate-600 font-medium">{bedsLabel}</div>
          <div className="p-2 bg-rose-500 rounded-full text-white shadow-xs">
            <Search className="w-3.5 h-3.5" strokeWidth={2.5} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPill;
