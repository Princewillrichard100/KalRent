"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FilterBar, { ActiveFilters } from "@/components/FilterBar";
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
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({});
  const [currentPage, setCurrentPage] = useState(1);

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
      isParkingIncluded: activeFilters.isParkingIncluded,
      amenities: activeFilters.amenities,
      baths: activeFilters.baths,
      beds: activeFilters.beds,
      priceMin: activeFilters.priceMin,
      priceMax: activeFilters.priceMax,
    };
  }, [
    location,
    paramLat,
    paramLng,
    guestCount,
    startDate,
    endDate,
    userCoords,
    viewportBounds,
    activeFilters,
  ]);

  const {
    data: properties,
    isLoading,
    isError,
    isFetching,
  } = useGetPropertiesQuery(queryFilters as any);

  // Pagination calculation
  const ITEMS_PER_PAGE = 12;
  const totalCount = properties?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const paginatedListings = useMemo(() => {
    if (!properties) return [];
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return properties.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [properties, currentPage]);

  const handleFilterChange = (newFilters: ActiveFilters) => {
    setActiveFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePriceChange = (min?: number, max?: number) => {
    setActiveFilters((prev) => ({
      ...prev,
      priceMin: min,
      priceMax: max,
    }));
    setCurrentPage(1);
  };

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

  // Location Focus Anchor Marker (Airbnb speech-bubble badge with spring bounce)
  const locationAnchor = useMemo(() => {
    const isNearMe = location.toLowerCase() === "near-me";
    const isAll = location.toLowerCase() === "all" || !location;
    if (isNearMe || isAll) return null;

    const lat = paramLat ? parseFloat(paramLat) : mapCenter[0];
    const lng = paramLng ? parseFloat(paramLng) : mapCenter[1];

    if (!lat || !lng) return null;

    const cleanName = location.split(",")[0].trim();

    return {
      name: cleanName,
      lat,
      lng,
    };
  }, [location, paramLat, paramLng, mapCenter]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* Dedicated Sub-Header Filter Bar (Sticky directly beneath Navbar) */}
      <div className="pt-20 sticky top-0 z-20 bg-white">
        <FilterBar
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
        />
      </div>

      <main className="flex-1 w-full max-w-[2520px] mx-auto px-4 md:px-8 py-6">
        {isError ? (
          <div className="w-full flex items-center justify-center py-20">
            <EmptyState
              title="Could not load properties"
              subtitle="There was an issue fetching listings for this location. Please try again."
              showReset
            />
          </div>
        ) : (
          <>
            {/* ========================================================================= */}
            {/* 1. DESKTOP VIEW (Natural flow on left, Sticky Floating Map on right) */}
            {/* ========================================================================= */}
            <div className="hidden lg:flex flex-row gap-8 items-start relative w-full">
              {/* Left Column: Natural Height Flow (Never leaves arbitrary empty whitespace) */}
              <div
                className={`${
                  showMapDesktop ? "w-[55%] xl:w-[58%]" : "w-full"
                } flex flex-col transition-all duration-200`}
              >
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
                  listings={paginatedListings}
                  totalCount={totalCount}
                  isFetching={isLoading || isFetching}
                  currentUser={authUser}
                  onListingClick={(item) => router.push(`/listings/${item.id}`)}
                  currentMinPrice={activeFilters.priceMin}
                  currentMaxPrice={activeFilters.priceMax}
                  onPriceChange={handlePriceChange}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>

              {/* Right Column: Sticky Floating Map Card */}
              {showMapDesktop && (
                <div className="hidden lg:block lg:w-[45%] xl:w-[42%] sticky top-[140px] self-start">
                  <div className="
                    w-full 
                    h-[calc(100vh-160px)] 
                    rounded-3xl 
                    overflow-hidden 
                    border border-neutral-200/90 
                    shadow-[0_4px_20px_rgba(0,0,0,0.08)]
                    relative
                  ">
                    <InteractiveSearchMap
                      listings={properties || []}
                      selectedListing={selectedListing}
                      onSelectListing={setSelectedListing}
                      center={mapCenter}
                      onBoundsChange={setViewportBounds}
                      isSearchingArea={isLoading || isFetching}
                      locationAnchor={locationAnchor}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ========================================================================= */}
            {/* 2. MOBILE VIEW (< lg) */}
            {/* ========================================================================= */}
            <div className="lg:hidden w-full">
              {showMapMobile ? (
                <div className="fixed inset-0 top-[140px] z-30 bg-white p-3">
                  <div className="w-full h-full rounded-3xl overflow-hidden border border-neutral-200/90 shadow-md relative">
                    <InteractiveSearchMap
                      listings={properties || []}
                      selectedListing={selectedListing}
                      onSelectListing={setSelectedListing}
                      center={mapCenter}
                      onBoundsChange={setViewportBounds}
                      isSearchingArea={isLoading || isFetching}
                      locationAnchor={locationAnchor}
                    />
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col">
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
                    listings={paginatedListings}
                    totalCount={totalCount}
                    isFetching={isLoading || isFetching}
                    currentUser={authUser}
                    onListingClick={(item) => router.push(`/listings/${item.id}`)}
                    currentMinPrice={activeFilters.priceMin}
                    currentMaxPrice={activeFilters.priceMax}
                    onPriceChange={handlePriceChange}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
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

              {/* Desktop Toggle Button (Shown when map is hidden to bring back map, like Airbnb) */}
              {!showMapDesktop && (
                <button
                  type="button"
                  onClick={() => setShowMapDesktop(true)}
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
                  <span>Show map</span>
                  <Map className="w-4 h-4 stroke-[2.2]" />
                </button>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
