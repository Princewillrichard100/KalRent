"use client";

import React, { useRef, useState, useEffect } from "react";
import { SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";

export interface ActiveFilters {
  isParkingIncluded?: boolean;
  amenities?: string[];
  baths?: number;
  beds?: number;
  priceMin?: number;
  priceMax?: number;
}

interface FilterBarProps {
  activeFilters: ActiveFilters;
  onFilterChange: (filters: ActiveFilters) => void;
  onOpenAdvancedModal?: () => void;
}

interface FilterCapsule {
  id: string;
  label: string;
  type: "amenity" | "parking" | "baths" | "beds";
  value?: any;
}

const CAPSULES: FilterCapsule[] = [
  { id: "parking", label: "Free parking", type: "parking", value: true },
  { id: "wifi", label: "Wifi", type: "amenity", value: "WiFi" },
  { id: "ac", label: "Air conditioning", type: "amenity", value: "AirConditioning" },
  { id: "pets", label: "Allows pets", type: "amenity", value: "PetsAllowed" },
  { id: "baths", label: "1+ bathrooms", type: "baths", value: 1 },
  { id: "beds", label: "2+ bedrooms", type: "beds", value: 2 },
  { id: "pool", label: "Pool", type: "amenity", value: "Pool" },
  { id: "gym", label: "Gym", type: "amenity", value: "Gym" },
  { id: "washer", label: "Washer & Dryer", type: "amenity", value: "WasherDryer" },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  activeFilters,
  onFilterChange,
  onOpenAdvancedModal,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === "left" ? -240 : 240;
    el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(checkScroll, 300);
  };

  const isCapsuleActive = (capsule: FilterCapsule): boolean => {
    if (capsule.type === "parking") {
      return Boolean(activeFilters.isParkingIncluded);
    }
    if (capsule.type === "amenity") {
      return Boolean(activeFilters.amenities?.includes(capsule.value));
    }
    if (capsule.type === "baths") {
      return (activeFilters.baths ?? 0) >= capsule.value;
    }
    if (capsule.type === "beds") {
      return (activeFilters.beds ?? 0) >= capsule.value;
    }
    return false;
  };

  const toggleCapsule = (capsule: FilterCapsule) => {
    const currentlyActive = isCapsuleActive(capsule);
    const newFilters = { ...activeFilters };

    if (capsule.type === "parking") {
      newFilters.isParkingIncluded = currentlyActive ? undefined : true;
    } else if (capsule.type === "amenity") {
      const currentList = newFilters.amenities || [];
      if (currentlyActive) {
        newFilters.amenities = currentList.filter((a) => a !== capsule.value);
        if (newFilters.amenities.length === 0) delete newFilters.amenities;
      } else {
        newFilters.amenities = [...currentList, capsule.value];
      }
    } else if (capsule.type === "baths") {
      newFilters.baths = currentlyActive ? undefined : capsule.value;
    } else if (capsule.type === "beds") {
      newFilters.beds = currentlyActive ? undefined : capsule.value;
    }

    onFilterChange(newFilters);
  };

  // Count active filter attributes
  const totalActiveFilters =
    (activeFilters.isParkingIncluded ? 1 : 0) +
    (activeFilters.amenities?.length || 0) +
    (activeFilters.baths ? 1 : 0) +
    (activeFilters.beds ? 1 : 0) +
    (activeFilters.priceMin || activeFilters.priceMax ? 1 : 0);

  return (
    <div className="w-full bg-white border-b border-neutral-200/90 relative z-20 select-none">
      <div className="flex items-center gap-3 px-4 sm:px-8 py-3 max-w-[1920px] mx-auto">
        {/* Filters Master Button */}
        <button
          type="button"
          onClick={onOpenAdvancedModal}
          className={`
            shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold
            border transition cursor-pointer shadow-sm
            ${
              totalActiveFilters > 0
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 bg-white text-neutral-800 hover:border-neutral-900"
            }
          `}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 stroke-[2.2]" />
          <span>Filters</span>
          {totalActiveFilters > 0 && (
            <span className="w-4 h-4 rounded-full bg-white text-neutral-900 text-[10px] font-bold flex items-center justify-center ml-0.5">
              {totalActiveFilters}
            </span>
          )}
        </button>

        {/* Vertical divider */}
        <div className="h-5 w-[1px] bg-neutral-200 shrink-0 hidden sm:block" />

        {/* Scrollable Capsule Carousel Container */}
        <div className="relative flex-1 min-w-0 flex items-center">
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-0 z-10 w-7 h-7 rounded-full bg-white/95 border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:scale-105 transition cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            onScroll={checkScroll}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 px-0.5 scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {CAPSULES.map((capsule) => {
              const active = isCapsuleActive(capsule);
              return (
                <button
                  key={capsule.id}
                  type="button"
                  onClick={() => toggleCapsule(capsule)}
                  className={`
                    border text-xs px-4 py-2 rounded-full whitespace-nowrap transition cursor-pointer select-none shrink-0 font-medium
                    ${
                      active
                        ? "border-neutral-900 bg-neutral-900 text-white shadow-sm font-semibold"
                        : "border-neutral-200 text-neutral-700 bg-white hover:border-neutral-900"
                    }
                  `}
                >
                  {capsule.label}
                </button>
              );
            })}
          </div>

          {canScrollRight && (
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 z-10 w-7 h-7 rounded-full bg-white/95 border border-neutral-200 shadow-md flex items-center justify-center text-neutral-700 hover:scale-105 transition cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
