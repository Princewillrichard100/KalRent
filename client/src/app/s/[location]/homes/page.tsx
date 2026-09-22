"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import ListingCard from "@/components/listings/ListingCard";
import ListingFeed from "@/components/listings/ListingFeed";
import InteractiveSearchMap, { BoundingBox, ViewportBounds } from "@/components/map/InteractiveSearchMap";
import { useGetAuthUserQuery, useGetPropertiesQuery } from "@/state/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import { Map, List, SearchX, ArrowLeft } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export default function SearchHomesPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { data: authUser } = useGetAuthUserQuery();
  const userCoords = useUserLocation();

  const rawLocation = (params?.location as string) || "";
  const location = decodeURIComponent(rawLocation);

  const [selectedListing, setSelectedListing] = useState<any | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);
  const [showMapDesktop, setShowMapDesktop] = useState(true);
  const [viewportBounds, setViewportBounds] = useState<ViewportBounds | null>(null);

  // Search parameters
  const paramLat = searchParams?.get("lat");
  const paramLng = searchParams?.get("lng");
  const paramSelectedId = searchParams?.get("selectedListing");
  const startDate = searchParams?.get("startDate") || searchParams?.get("checkin");
  const endDate = searchParams?.get("endDate") || searchParams?.get("checkout");
  const guestCount = searchParams?.get("guestCount") || searchParams?.get("guests");

  const queryFilters = useMemo(() => {
    const isNearMe = location.toLowerCase() === "near-me";
    const isAll = location.toLowerCase() === "all";

    const parsedSearchLat = paramLat ? parseFloat(paramLat) : undefined;
    const parsedSearchLng = paramLng ? parseFloat(paramLng) : undefined;

    return {
      locationValue: !viewportBounds && !isNearMe && !isAll && location ? location : undefined,
      guestCount: guestCount || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      userLat: userCoords?.lat,
      userLng: userCoords?.lng,
      lat: parsedSearchLat,
      lng: parsedSearchLng,
      ne_lat: viewportBounds?.ne_lat,
      ne_lng: viewportBounds?.ne_lng,
      sw_lat: viewportBounds?.sw_lat,
      sw_lng: viewportBounds?.sw_lng,
    };
  }, [location, paramLat, paramLng, guestCount, startDate, endDate, userCoords, viewportBounds]);

  const {
    data: properties,
    isLoading,
    isError,
    isFetching,
  } = useGetPropertiesQuery(queryFilters as any);

  // Auto-select listing on map if selectedListing query param was passed from Hop 1
  useEffect(() => {
    if (paramSelectedId && properties && properties.length > 0) {
      const match = properties.find((p) => p.id === Number(paramSelectedId));
      if (match) {
        setSelectedListing(match);
      }
    }
  }, [paramSelectedId, properties]);

  // Center coordinates for map
  const mapCenter = useMemo<[number, number]>(() => {
    if (paramLat && paramLng) {
      return [parseFloat(paramLat), parseFloat(paramLng)];
    }
    if (properties && properties.length > 0) {
      const firstWithCoords = properties.find(
        (p) =>
          p.location?.coordinates?.latitude &&
          p.location?.coordinates?.longitude &&
          p.location.coordinates.latitude !== 0
      );
      if (firstWithCoords) {
        return [
          firstWithCoords.location.coordinates.latitude,
          firstWithCoords.location.coordinates.longitude,
        ];
      }
    }
    if (userCoords?.lat && userCoords?.lng) {
      return [userCoords.lat, userCoords.lng];
    }
    return [6.4531, 3.4395]; // Default Ikoyi/Lagos
  }, [paramLat, paramLng, properties, userCoords]);

  // Format header title
  const headingTitle = useMemo(() => {
    if (location.toLowerCase() === "near-me") {
      return "Homes near you";
    }
    if (location.toLowerCase() === "all" || !location) {
      return "All accommodations";
    }
    return `Stays in ${location}`;
  }, [location]);

  return (
    <div className="h-full w-full min-h-screen bg-white">
      <Navbar />

      <main className="h-full w-full pt-20 md:pt-36">
        <div className="relative w-full h-[calc(100vh-80px)] overflow-hidden bg-white">
          {isLoading ? (
            <div className="w-full h-full p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ListingCard key={i} isLoading={true} />
                ))}
              </div>
            </div>
          ) : isError ? (
            <div className="w-full h-full flex items-center justify-center p-8">
              <EmptyState
                title="Could not load properties"
                subtitle="There was an issue fetching listings for this location. Please try again."
                showReset
              />
            </div>
          ) : (
            <>
              {/* ========================================================================= */}
              {/* 1. DESKTOP VIEW (58% List / 42% Sticky Interactive Map) */}
              {/* ========================================================================= */}
              <div className="hidden lg:flex w-full h-full overflow-hidden">
                {showMapDesktop ? (
                  <>
                    {/* Left Column: Scrollable Feed */}
                    <div className="w-[58%] h-full overflow-y-auto px-6 xl:px-8 py-5 border-r border-neutral-200/80">
                      {/* Back link & breadcrumbs */}
                      <div className="flex items-center gap-2 mb-3">
                        <Link
                          href="/"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black transition"
                        >
                          <ArrowLeft className="w-3.5 h-3.5" />
                          <span>All collections</span>
                        </Link>
                      </div>

                      <ListingFeed
                        listings={properties || []}
                        totalCount={properties?.length || 0}
                        isFetching={isFetching}
                        currentUser={authUser}
                        onListingClick={(item) => router.push(`/listings/${item.id}`)}
                      />
                    </div>

                    {/* Right Column: Sticky Map */}
                    <div className="w-[42%] h-full relative">
                      <InteractiveSearchMap
                        listings={properties || []}
                        selectedListing={selectedListing}
                        onSelectListing={setSelectedListing}
                        center={mapCenter}
                        onBoundsChange={setViewportBounds}
                        isSearchingArea={isFetching}
                      />
                    </div>
                  </>
                ) : (
                  // Full-width grid when map is toggled off
                  <div className="w-full h-full overflow-y-auto px-6 md:px-12 py-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-black transition"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All collections</span>
                      </Link>
                    </div>

                    <ListingFeed
                      listings={properties || []}
                      totalCount={properties?.length || 0}
                      isFetching={isFetching}
                      currentUser={authUser}
                      onListingClick={(item) => router.push(`/listings/${item.id}`)}
                    />
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* 2. MOBILE VIEW (< lg) */}
              {/* ========================================================================= */}
              <div className="lg:hidden w-full h-full overflow-hidden">
                {showMapMobile ? (
                  <div className="w-full h-full relative">
                    <InteractiveSearchMap
                      listings={properties || []}
                      selectedListing={selectedListing}
                      onSelectListing={setSelectedListing}
                      center={mapCenter}
                      onBoundsChange={setViewportBounds}
                      isSearchingArea={isFetching}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full overflow-y-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href="/"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-500"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>All</span>
                      </Link>
                    </div>

                    <ListingFeed
                      listings={properties || []}
                      totalCount={properties?.length || 0}
                      isFetching={isFetching}
                      currentUser={authUser}
                      onListingClick={(item) => router.push(`/listings/${item.id}`)}
                    />
                  </div>
                )}
              </div>

              {/* ========================================================================= */}
              {/* 3. FLOATING TOGGLE PILL BUTTON (Mobile & Desktop) */}
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
