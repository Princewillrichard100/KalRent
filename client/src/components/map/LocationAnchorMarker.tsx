"use client";

import React from "react";

export interface LocationAnchorMarkerProps {
  name: string;
  lat?: number;
  lng?: number;
}

export function LocationAnchorMarker({ name }: LocationAnchorMarkerProps) {
  return (
    <div
      className="location-anchor-marker pointer-events-none select-none"
      style={{
        transform: "translate(-50%, -100%)",
      }}
    >
      <div className="flex flex-col items-center">
        {/* Animated Pill Container */}
        <div
          className="
            animate-airbnb-bounce
            flex items-center gap-1.5 
            bg-white text-neutral-900 
            px-3 py-1.5 rounded-full 
            shadow-[0_4px_16px_rgba(0,0,0,0.18)] 
            border border-neutral-200/90
            whitespace-nowrap
          "
        >
          {/* Black Map Pin Icon */}
          <svg
            className="w-3.5 h-3.5 text-neutral-900 fill-current shrink-0"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>

          {/* Location Title */}
          <span className="font-bold text-xs tracking-tight text-neutral-900">
            {name}
          </span>
        </div>

        {/* Speech-Bubble Downward Beak / Pointer */}
        <div
          className="
            -mt-[1px]
            w-0 h-0 
            border-l-[6px] border-l-transparent 
            border-r-[6px] border-r-transparent 
            border-t-[6px] border-t-white 
            filter drop-shadow-[0_2px_1px_rgba(0,0,0,0.08)]
          "
        />
      </div>
    </div>
  );
}

export default LocationAnchorMarker;
