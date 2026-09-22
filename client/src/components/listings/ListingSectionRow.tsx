"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ListingCard from "@/components/listings/ListingCard";
import { Property } from "@/types/prismaTypes";

export interface SectionData {
  title: string;
  subtitle?: string;
  location: string;
  placeId?: string;
  lat?: number;
  lng?: number;
  listings: (Property & {
    distanceKm?: number;
    distance_km?: number;
    city?: string;
    state?: string;
  })[];
}

interface ListingSectionRowProps {
  section: SectionData;
  currentUser?: any;
}

export const ListingSectionRow: React.FC<ListingSectionRowProps> = ({
  section,
  currentUser,
}) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollability = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScrollability();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollability, { passive: true });
    window.addEventListener("resize", checkScrollability);

    return () => {
      el.removeEventListener("scroll", checkScrollability);
      window.removeEventListener("resize", checkScrollability);
    };
  }, [checkScrollability, section.listings]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.75;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
  };

  const sectionSearchHref = `/s/${encodeURIComponent(
    section.location
  )}/homes?placeId=${encodeURIComponent(section.placeId || "")}${
    section.lat && section.lng ? `&lat=${section.lat}&lng=${section.lng}` : ""
  }`;

  const handleCardClick = (listing: Property) => {
    const lng = listing.location?.coordinates?.longitude;
    const lat = listing.location?.coordinates?.latitude;
    const targetLocation = listing.location?.city || section.location;

    const queryParams = new URLSearchParams();
    queryParams.set("selectedListing", listing.id.toString());
    if (lat && lng) {
      queryParams.set("lat", lat.toString());
      queryParams.set("lng", lng.toString());
    }
    if (section.placeId) {
      queryParams.set("placeId", section.placeId);
    }

    router.push(`/s/${encodeURIComponent(targetLocation)}/homes?${queryParams.toString()}`);
  };

  if (!section.listings || section.listings.length === 0) return null;

  return (
    <section className="w-full py-6 md:py-8 border-b border-neutral-100 last:border-b-0">
      {/* 1. Header with Clickable Title and Scroll Chevrons */}
      <div className="flex items-center justify-between gap-4 mb-4 px-1">
        <div>
          <Link
            href={sectionSearchHref}
            className="group inline-flex items-center gap-2 text-xl sm:text-2xl font-bold text-neutral-900 hover:underline"
          >
            <span>{section.title}</span>
            <span className="text-xl font-normal transition-transform duration-200 group-hover:translate-x-1.5 text-neutral-600">
              →
            </span>
          </Link>
          {section.subtitle && (
            <p className="text-sm text-neutral-500 mt-0.5">{section.subtitle}</p>
          )}
        </div>

        {/* Scroll Chevrons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            disabled={!canScrollLeft}
            aria-label="Previous listings"
            className={`w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center transition ${
              canScrollLeft
                ? "hover:border-black text-neutral-800 cursor-pointer hover:scale-105"
                : "opacity-30 text-neutral-300 cursor-not-allowed"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            disabled={!canScrollRight}
            aria-label="Next listings"
            className={`w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center transition ${
              canScrollRight
                ? "hover:border-black text-neutral-800 cursor-pointer hover:scale-105"
                : "opacity-30 text-neutral-300 cursor-not-allowed"
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Horizontally Scrollable Row with Snap Scrolling */}
      <div
        ref={scrollRef}
        className="flex gap-5 md:gap-6 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-3 px-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {section.listings.map((listing) => (
          <div
            key={listing.id}
            className="min-w-[270px] sm:min-w-[290px] md:min-w-[310px] max-w-[320px] shrink-0 snap-start"
          >
            <ListingCard
              data={listing}
              currentUser={currentUser}
              onClick={() => handleCardClick(listing)}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default ListingSectionRow;
