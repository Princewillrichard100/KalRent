"use client";

import React, { useMemo, useState } from "react";
import HomesClient from "@/components/HomesClient";
import { useGetAuthUserQuery, useGetPropertiesQuery } from "@/state/api";
import { useSearchParams } from "next/navigation";
import { useUserLocation } from "@/hooks/useUserLocation";
import { BoundingBox } from "@/components/map/InteractiveSearchMap";

const SearchPage = () => {
  const searchParams = useSearchParams();
  const { data: authUser } = useGetAuthUserQuery();
  const userCoords = useUserLocation();
  const [customBbox, setCustomBbox] = useState<BoundingBox | null>(null);

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
      lat: parsedSearchLat,
      lng: parsedSearchLng,
      minLat: customBbox?.minLat,
      maxLat: customBbox?.maxLat,
      minLng: customBbox?.minLng,
      maxLng: customBbox?.maxLng,
    };
  }, [searchParams, userCoords, customBbox]);

  const {
    data: properties,
    isLoading,
    isError,
    isFetching,
  } = useGetPropertiesQuery(queryFilters as any);

  return (
    <div className="w-full h-full">
      <HomesClient
        properties={properties || []}
        isLoading={isLoading}
        isError={isError}
        authUser={authUser}
        userCoords={userCoords}
        onBboxChange={setCustomBbox}
        isSearchingArea={isFetching}
      />
    </div>
  );
};

export default SearchPage;
