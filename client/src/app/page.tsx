"use client";

import Container from "@/components/Container";
import EmptyState from "@/components/EmptyState";
import ListingCard from "@/components/listings/ListingCard";
import Navbar from "@/components/Navbar";
import { useGetAuthUserQuery, useGetPropertiesQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";

export default function Home() {
  const searchParams = useSearchParams();
  const { data: authUser } = useGetAuthUserQuery();
  const userCoords = useUserLocation();

  const queryFilters = useMemo(() => {
    const category = searchParams?.get("category") || searchParams?.get("propertyType");
    const location = searchParams?.get("location") || searchParams?.get("campusZone");
    const locationValue = searchParams?.get("locationValue") || searchParams?.get("location");
    const guestCount = searchParams?.get("guestCount");
    const roomCount = searchParams?.get("roomCount");
    const bathroomCount = searchParams?.get("bathroomCount") || searchParams?.get("baths");
    const startDate = searchParams?.get("startDate");
    const endDate = searchParams?.get("endDate");
    const beds = searchParams?.get("beds");

    const searchLat = searchParams?.get("lat");
    const searchLng = searchParams?.get("lng");
    const parsedSearchLat = searchLat ? parseFloat(searchLat) : undefined;
    const parsedSearchLng = searchLng ? parseFloat(searchLng) : undefined;

    return {
      category: category || undefined,
      location: location || undefined,
      locationValue: locationValue || undefined,
      guestCount: guestCount || undefined,
      roomCount: roomCount || undefined,
      bathroomCount: bathroomCount || undefined,
      beds: beds || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      userLat: userCoords?.lat,
      userLng: userCoords?.lng,
      lat: parsedSearchLat ?? userCoords?.lat,
      lng: parsedSearchLng ?? userCoords?.lng,
    };
  }, [searchParams, userCoords]);

  const { data: properties, isLoading, isError } = useGetPropertiesQuery(queryFilters as any);

  return (
    <div className="h-full w-full min-h-screen bg-white">
      <Navbar />

      <main className="h-full w-full">
        {isLoading ? (
          <Container className="pt-24 sm:pt-28 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 min-[2200px]:grid-cols-5 gap-8">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-3 w-full animate-pulse">
                  <div className="aspect-square w-full rounded-2xl bg-neutral-200"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-neutral-200 rounded w-2/3"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/5"></div>
                  </div>
                  <div className="h-4 bg-neutral-100 rounded w-1/2"></div>
                  <div className="h-4 bg-neutral-100 rounded w-1/3"></div>
                  <div className="h-5 bg-neutral-200 rounded w-1/3 mt-1"></div>
                </div>
              ))}
            </div>
          </Container>
        ) : isError || !properties || properties.length === 0 ? (
          <div className="pt-24 sm:pt-28">
            <EmptyState showReset />
          </div>
        ) : (
          <Container className="pt-24 sm:pt-28 pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 min-[2200px]:grid-cols-5 gap-8">
              {properties.map((property) => (
                <ListingCard
                  key={property.id}
                  data={property}
                  currentUser={authUser}
                />
              ))}
            </div>
          </Container>
        )}
      </main>
    </div>
  );
}
