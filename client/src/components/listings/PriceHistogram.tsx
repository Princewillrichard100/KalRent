"use client";

import React, { useMemo, useState, useEffect } from "react";
import { formatPricePill } from "@/components/map/InteractiveSearchMap";

interface PriceHistogramProps {
  listings: any[];
  currentMinPrice?: number;
  currentMaxPrice?: number;
  onPriceChange: (min?: number, max?: number) => void;
}

export const PriceHistogram: React.FC<PriceHistogramProps> = ({
  listings,
  currentMinPrice,
  currentMaxPrice,
  onPriceChange,
}) => {
  // 1. Calculate price range from listings (with sensible defaults)
  const { minBound, maxBound, buckets } = useMemo(() => {
    const prices = listings
      .map((l) => l.annualRent || l.price)
      .filter((p): p is number => typeof p === "number" && p > 0);

    const lowest = prices.length > 0 ? Math.min(...prices) : 100_000;
    const highest = prices.length > 0 ? Math.max(...prices) : 15_000_000;

    const floor = Math.max(0, Math.floor(lowest * 0.8));
    const ceil = Math.ceil(highest * 1.1);

    const BUCKET_COUNT = 32;
    const step = (ceil - floor) / BUCKET_COUNT;
    const counts = new Array(BUCKET_COUNT).fill(0);

    prices.forEach((price) => {
      const idx = Math.min(
        BUCKET_COUNT - 1,
        Math.max(0, Math.floor((price - floor) / (step || 1)))
      );
      counts[idx]++;
    });

    const maxCount = Math.max(1, ...counts);
    const normalizedBuckets = counts.map((count) => Math.max(0.08, count / maxCount));

    return {
      minBound: floor,
      maxBound: ceil,
      buckets: normalizedBuckets,
    };
  }, [listings]);

  const [minVal, setMinVal] = useState<number>(currentMinPrice ?? minBound);
  const [maxVal, setMaxVal] = useState<number>(currentMaxPrice ?? maxBound);

  // Sync when bounds change
  useEffect(() => {
    if (currentMinPrice === undefined) setMinVal(minBound);
    if (currentMaxPrice === undefined) setMaxVal(maxBound);
  }, [minBound, maxBound, currentMinPrice, currentMaxPrice]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxVal - 50_000);
    setMinVal(value);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minVal + 50_000);
    setMaxVal(value);
  };

  const handleCommitChange = () => {
    const finalMin = minVal <= minBound ? undefined : minVal;
    const finalMax = maxVal >= maxBound ? undefined : maxVal;
    onPriceChange(finalMin, finalMax);
  };

  // Convert price to readable short string
  const formatShort = (amount: number) => {
    if (amount >= 1_000_000) {
      const val = amount / 1_000_000;
      return `₦${val % 1 === 0 ? val : val.toFixed(1)}M`;
    }
    if (amount >= 1_000) {
      return `₦${Math.round(amount / 1_000)}k`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const leftPercent = Math.max(0, Math.min(100, ((minVal - minBound) / (maxBound - minBound || 1)) * 100));
  const rightPercent = Math.max(0, Math.min(100, ((maxVal - minBound) / (maxBound - minBound || 1)) * 100));

  return (
    <div className="col-span-1 sm:col-span-2 bg-[#F7F7F7]/90 border border-neutral-200/90 rounded-3xl p-5 sm:p-7 select-none my-3 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight">
          See what&apos;s in your price range
        </h3>
        <p className="text-xs text-neutral-500 font-normal">
          Trip price, includes all fees
        </p>
      </div>

      {/* Histogram Bars Container */}
      <div className="relative pt-6 pb-2">
        <div className="h-16 flex items-end gap-1 px-2">
          {buckets.map((heightRatio, i) => {
            const bucketPercent = (i / buckets.length) * 100;
            const isInRange = bucketPercent >= leftPercent && bucketPercent <= rightPercent;

            return (
              <div
                key={i}
                className="flex-1 flex items-end justify-center h-full"
              >
                <div
                  style={{ height: `${Math.round(heightRatio * 100)}%` }}
                  className={`w-full rounded-t-sm transition-colors duration-150 ${
                    isInRange ? "bg-[#FF385C]" : "bg-neutral-300/80"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Dual Range Track & Thumbs */}
        <div className="relative h-6 flex items-center">
          {/* Base track */}
          <div className="absolute w-full h-1 bg-neutral-300 rounded-full" />
          {/* Active highlighted track */}
          <div
            className="absolute h-1 bg-[#FF385C] rounded-full"
            style={{
              left: `${leftPercent}%`,
              width: `${Math.max(0, rightPercent - leftPercent)}%`,
            }}
          />

          {/* HTML Dual Range Inputs (Overlaid) */}
          <input
            type="range"
            min={minBound}
            max={maxBound}
            step={50_000}
            value={minVal}
            onChange={handleMinChange}
            onMouseUp={handleCommitChange}
            onTouchEnd={handleCommitChange}
            className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer pointer-events-auto"
            aria-label="Minimum price"
          />
          <input
            type="range"
            min={minBound}
            max={maxBound}
            step={50_000}
            value={maxVal}
            onChange={handleMaxChange}
            onMouseUp={handleCommitChange}
            onTouchEnd={handleCommitChange}
            className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer pointer-events-auto"
            aria-label="Maximum price"
          />

          {/* Left Thumb Visual */}
          <div
            className="absolute w-6 h-6 rounded-full bg-white border-2 border-neutral-300 shadow-md flex items-center justify-center -translate-x-1/2 pointer-events-none transition-transform active:scale-110 z-20"
            style={{ left: `${leftPercent}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          </div>

          {/* Right Thumb Visual */}
          <div
            className="absolute w-6 h-6 rounded-full bg-white border-2 border-neutral-300 shadow-md flex items-center justify-center -translate-x-1/2 pointer-events-none transition-transform active:scale-110 z-20"
            style={{ left: `${rightPercent}%` }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-600" />
          </div>
        </div>

        {/* Labels under slider */}
        <div className="flex justify-between items-center text-xs font-semibold text-neutral-800 mt-2 px-1">
          <span>{formatShort(minVal)}</span>
          <span>{formatShort(maxVal)}+</span>
        </div>
      </div>
    </div>
  );
};

export default PriceHistogram;
