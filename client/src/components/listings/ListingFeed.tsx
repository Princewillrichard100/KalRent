"use client";

import React, { useState, useEffect, useRef, Fragment } from "react";
import ListingCard from "@/components/listings/ListingCard";
import PriceHistogram from "@/components/listings/PriceHistogram";
import Pagination from "@/components/listings/Pagination";
import { SearchX, Tag } from "lucide-react";

export interface ListingFeedProps {
  listings: any[];
  totalCount: number;
  isFetching: boolean;
  currentUser?: any;
  onListingClick?: (listing: any) => void;
  title?: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  onPriceChange?: (min?: number, max?: number) => void;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

export function ListingFeed({
  listings,
  totalCount,
  isFetching,
  currentUser,
  onListingClick,
  currentMinPrice,
  currentMaxPrice,
  onPriceChange,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}: ListingFeedProps) {
  const [isSmoothLoading, setIsSmoothLoading] = useState(isFetching);
  const fetchStartRef = useRef<number>(0);

  // Enforce a calm, minimum duration (~450ms) so rapid local fetches never flash/flicker
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isFetching) {
      fetchStartRef.current = Date.now();
      setIsSmoothLoading(true);
    } else {
      const elapsed = Date.now() - fetchStartRef.current;
      const minDuration = 450; // smooth minimum hold (Airbnb-feel)
      const remaining = Math.max(0, minDuration - elapsed);

      timeout = setTimeout(() => {
        setIsSmoothLoading(false);
      }, remaining);
    }

    return () => clearTimeout(timeout);
  }, [isFetching]);

  // Insert histogram after card 4 (or after card 2 if fewer than 4)
  const histogramInsertIndex = listings.length >= 4 ? 3 : listings.length > 0 ? listings.length - 1 : -1;

  return (
    <div className="flex flex-col w-full">
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 px-1">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-950 transition-opacity duration-200">
          {isSmoothLoading ? (
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
        {/* Initial Load: In-Flow Skeletons (Prevents container collapse and 0px jump) */}
        {listings.length === 0 && isSmoothLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-6 pb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <ListingCard key={i} isLoading={true} />
            ))}
          </div>
        ) : listings.length === 0 && !isSmoothLoading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-3">
              <SearchX className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-neutral-900 text-sm mb-1">
              No homes found in this map area
            </h3>
            <p className="text-xs text-neutral-500">
              Try adjusting your filters, zooming out, or panning to an adjacent neighborhood.
            </p>
          </div>
        ) : (
          <>
            {/* Subsequent fetches (map pan / filter updates): Smooth Semi-Transparent Skeleton Layer */}
            <div
              className={`absolute inset-0 z-20 bg-white/50 backdrop-blur-[1px] grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-6 pointer-events-none transition-all duration-200 ease-out ${
                isSmoothLoading
                  ? "opacity-100 visible"
                  : "opacity-0 invisible"
              }`}
            >
              {Array.from({ length: Math.min(6, listings.length || 6) }).map((_, i) => (
                <ListingCard key={i} isLoading={true} />
              ))}
            </div>

            {/* Existing / Updated Cards */}
            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-5 xl:gap-6 pb-8 transition-opacity duration-300 ease-out ${
                isSmoothLoading ? "opacity-30" : "opacity-100"
              }`}
            >
              {listings.map((item, index) => (
                <Fragment key={item.id}>
                  <ListingCard
                    data={item}
                    currentUser={currentUser}
                    onClick={() => onListingClick?.(item)}
                  />

                  {/* Inline Price Histogram Box embedded in feed */}
                  {index === histogramInsertIndex && onPriceChange && (
                    <PriceHistogram
                      listings={listings}
                      currentMinPrice={currentMinPrice}
                      currentMaxPrice={currentMaxPrice}
                      onPriceChange={onPriceChange}
                    />
                  )}
                </Fragment>
              ))}
            </div>
          </>
        )}

        {/* Bottom Circular Pagination */}
        {!isSmoothLoading && listings.length > 0 && onPageChange && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}

export default ListingFeed;
