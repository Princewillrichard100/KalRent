"use client";

import { useMemo } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { Search, Home } from "lucide-react";
import { useSearchModal } from "@/hooks/useSearchModal";
import { differenceInDays } from "date-fns";

export const SearchPill = () => {
  const searchModal = useSearchModal();
  const params = useSearchParams();
  const pathParams = useParams();

  const pathLocation = pathParams?.location as string | undefined;
  const decodedPathLocation = pathLocation ? decodeURIComponent(pathLocation) : undefined;

  const location = params?.get("location") || params?.get("locationValue") || params?.get("campusZone");
  const lat = params?.get("lat");
  const lng = params?.get("lng");
  const startDate = params?.get("startDate");
  const endDate = params?.get("endDate");
  const guestCount = params?.get("guestCount") || params?.get("beds");

  const locationLabel = useMemo(() => {
    if (decodedPathLocation && decodedPathLocation !== "all") {
      if (decodedPathLocation === "near-me") return "Near you";
      return decodedPathLocation;
    }
    if (location && location !== "Near me" && location !== "Homes near you") {
      return location;
    }
    if (lat && lng) {
      return "Near you";
    }
    return "Anywhere in Nigeria";
  }, [decodedPathLocation, location, lat, lng]);

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
      onClick={() => {
        if (window.innerWidth >= 768) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          searchModal.onOpen();
        }
      }}
      className="
        border 
        border-slate-200 
        w-full 
        md:w-auto 
        py-1.5
        px-1
        rounded-full 
        shadow-xs 
        hover:shadow-md 
        transition 
        cursor-pointer
        bg-white
      "
    >
      <div className="flex flex-row items-center justify-between">
        <div className="text-sm font-semibold pl-3 pr-4 text-neutral-900 truncate max-w-[170px] flex items-center gap-2">
          <Home className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span className="truncate">{locationLabel}</span>
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
