"use client";

import React from "react";
import ListingCard from "@/components/listings/ListingCard";
import { SearchX, Tag } from "lucide-react";

export interface ListingFeedProps {
  listings: any[];
  totalCount: number;
  isFetching: boolean;
  currentUser?: any;
  onListingClick?: (listing: any) => void;
  title?: string;
}

export function ListingFeed({
  listings,
  totalCount,
  isFetching,
  currentUser,
  onListingClick,
}: ListingFeedProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-950">
          {isFetching ? (
            <span className="inline-block w-48 sm:w-64 h-7 bg-neutral-200 animate-pulse rounded-md" />
          ) : (
            `${
              totalCount > 1000 ? "Over 1,000" : totalCount
            } ${totalCount === 1 ? "home" : "homes"} within map area`
          )}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium bg-neutral-50 border border-neutral-200/80 px-2.5 py-1.5 rounded-full shadow-sm select-none">
          <Tag className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Prices include all fees</span>
        </div>
      </div>

      {/* Grid with Transition Overlay */}
      <div className="relative flex-1">
        {/* Subtle Semi-Transparent Skeleton Layer during fetching */}
        {isFetching && (
          <div className="absolute inset-0 z-20 bg-white/40 backdrop-blur-[1px] grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-6 pointer-events-none transition-opacity duration-300">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className="aspect-square w-full bg-neutral-200/80 animate-pulse rounded-2xl" />
                <div className="h-4 w-3/4 bg-neutral-200/80 animate-pulse rounded-md" />
                <div className="h-3 w-1/2 bg-neutral-200/60 animate-pulse rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* Existing / Updated Cards */}
        {listings.length === 0 && !isFetching ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm mb-1">
              No homes found in this map area
            </h3>
            <p className="text-xs text-neutral-500">
              Try zooming out or panning to an adjacent neighborhood.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-6 pb-24 transition-opacity duration-200 ${
              isFetching ? "opacity-30" : "opacity-100"
            }`}
          >
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                data={item}
                currentUser={currentUser}
                onClick={() => onListingClick?.(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingFeed;
