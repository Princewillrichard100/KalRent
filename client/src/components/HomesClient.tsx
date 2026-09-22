"use client";

import React, { useState, useMemo } from "react";
import ListingCard from "@/components/listings/ListingCard";
import InteractiveSearchMap, { BoundingBox } from "@/components/map/InteractiveSearchMap";
import { Property } from "@/types/prismaTypes";
import { Map, List, SearchX } from "lucide-react";
import EmptyState from "@/components/EmptyState";

interface HomesClientProps {
  properties: (Property & {
    distanceKm?: number;
    distance_km?: number;
    city?: string;
    state?: string;
  })[];
  isLoading: boolean;
  isError: boolean;
  authUser: any;
  userCoords?: { lat: number; lng: number } | null;
  onBboxChange?: (bbox: BoundingBox) => void;
  isSearchingArea?: boolean;
}

export const HomesClient: React.FC<HomesClientProps> = ({
  properties,
  isLoading,
  isError,
  authUser,
  userCoords,
  onBboxChange,
  isSearchingArea = false,
}) => {
  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [showMapDesktop, setShowMapDesktop] = useState(true);

  const mapCenter = useMemo<[number, number]>(() => {
    if (userCoords?.lat && userCoords?.lng) {
      return [userCoords.lat, userCoords.lng];
    }
    return [6.4531, 3.4395]; // Default Ikoyi/Lagos
  }, [userCoords]);

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="w-full h-full p-6 md:p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="aspect-square w-full rounded-2xl bg-neutral-200"></div>
              <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
              <div className="h-3.5 bg-neutral-100 rounded w-1/2"></div>
              <div className="h-4 bg-neutral-200 rounded w-1/3 mt-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <EmptyState
          title="Could not load properties"
          subtitle="There was an issue fetching listings. Please try again."
          showReset
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-white">
      {/* ========================================================================= */}
      {/* 1. DESKTOP VIEW (lg:flex) */}
      {/* ========================================================================= */}
      <div className="hidden lg:flex w-full h-full overflow-hidden">
        {showMapDesktop ? (
          // Split-Screen Layout: 58% Listings | 42% Sticky Interactive Map
          <>
            <div className="w-[58%] h-full overflow-y-auto px-6 xl:px-8 py-5 border-r border-neutral-200/80">
              <div className="text-xs font-semibold text-neutral-500 mb-4 px-1">
                Over {properties.length} verified {properties.length === 1 ? "home" : "homes"} found
              </div>

              {properties.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto mb-3">
                    <SearchX className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-neutral-900 text-sm mb-1">No homes found in this area</h3>
                  <p className="text-xs text-neutral-500">Try zooming out or searching another destination.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-5 xl:gap-6 pb-24">
                  {properties.map((item) => (
                    <ListingCard
                      key={item.id}
                      data={item}
                      currentUser={authUser}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="w-[42%] h-full relative">
              <InteractiveSearchMap
                listings={properties}
                selectedListing={selectedListing}
                onSelectListing={setSelectedListing}
                center={mapCenter}
                onSearchArea={onBboxChange}
                isSearchingArea={isSearchingArea}
              />
            </div>
          </>
        ) : (
          // Full-Width Grid (When user toggles off map on desktop)
          <div className="w-full h-full overflow-y-auto px-6 md:px-12 py-6">
            <div className="text-xs font-semibold text-neutral-500 mb-4 px-1">
              Over {properties.length} verified {properties.length === 1 ? "home" : "homes"} found
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-7 pb-24">
              {properties.map((item) => (
                <ListingCard
                  key={item.id}
                  data={item}
                  currentUser={authUser}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE / TABLET VIEW (< lg) */}
      {/* ========================================================================= */}
      <div className="lg:hidden w-full h-full overflow-hidden">
        {showMapMobile ? (
          // Full-screen Map on mobile
          <div className="w-full h-full relative">
            <InteractiveSearchMap
              listings={properties}
              selectedListing={selectedListing}
              onSelectListing={setSelectedListing}
              center={mapCenter}
              onSearchArea={onBboxChange}
              isSearchingArea={isSearchingArea}
            />
          </div>
        ) : (
          // Full-screen Listings list on mobile
          <div className="w-full h-full overflow-y-auto px-4 sm:px-6 py-4">
            <div className="text-xs font-semibold text-neutral-500 mb-3 px-1">
              {properties.length} {properties.length === 1 ? "home" : "homes"} available
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-24">
              {properties.map((item) => (
                <ListingCard
                  key={item.id}
                  data={item}
                  currentUser={authUser}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. AIRBNB FLOATING BOTTOM TOGGLE PILL BUTTON (Mobile & Desktop) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-7 left-1/2 -translate-x-1/2 z-40">
        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setShowMapMobile((prev) => !prev)}
          className="
            lg:hidden
            flex items-center gap-2 
            bg-neutral-900 hover:bg-black 
            text-white 
            font-semibold 
            text-sm 
            px-5 py-3 
            rounded-full 
            shadow-[0_8px_24px_rgba(0,0,0,0.3)] 
            hover:scale-105 active:scale-95 
            transition-all duration-200 
            cursor-pointer
          "
        >
          {showMapMobile ? (
            <>
              <span>Show list</span>
              <List className="w-4 h-4 stroke-[2.2]" />
            </>
          ) : (
            <>
              <span>Show map</span>
              <Map className="w-4 h-4 stroke-[2.2]" />
            </>
          )}
        </button>

        {/* Desktop Toggle Button */}
        <button
          type="button"
          onClick={() => setShowMapDesktop((prev) => !prev)}
          className="
            hidden lg:flex 
            items-center gap-2 
            bg-neutral-900 hover:bg-black 
            text-white 
            font-semibold 
            text-sm 
            px-5 py-3 
            rounded-full 
            shadow-[0_8px_24px_rgba(0,0,0,0.3)] 
            hover:scale-105 active:scale-95 
            transition-all duration-200 
            cursor-pointer
          "
        >
          {showMapDesktop ? (
            <>
              <span>Show list</span>
              <List className="w-4 h-4 stroke-[2.2]" />
            </>
          ) : (
            <>
              <span>Show map</span>
              <Map className="w-4 h-4 stroke-[2.2]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default HomesClient;
