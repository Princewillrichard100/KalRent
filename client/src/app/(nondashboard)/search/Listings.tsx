"use client";

import {
  useAddFavoritePropertyMutation,
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
  useRemoveFavoritePropertyMutation,
} from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { setFilters, setHoveredPropertyId, initialState } from "@/state";
import { Property } from "@/types/prismaTypes";
import Card from "@/components/Card";
import React from "react";
import CardCompact from "@/components/CardCompact";
import { SearchX, RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const ListingsSkeleton = () => (
  <div className="p-4 space-y-5 w-full">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs animate-pulse space-y-3"
      >
        <div className="w-full h-44 bg-slate-200 rounded-xl"></div>
        <div className="h-5 bg-slate-200 rounded w-3/4"></div>
        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
        <div className="flex justify-between items-center pt-2">
          <div className="h-6 bg-slate-200 rounded w-1/4"></div>
          <div className="h-4 bg-slate-100 rounded w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const Listings = () => {
  const dispatch = useAppDispatch();
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );
  const [addFavorite] = useAddFavoritePropertyMutation();
  const [removeFavorite] = useRemoveFavoritePropertyMutation();
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const filters = useAppSelector((state) => state.global.filters);
  const hoveredPropertyId = useAppSelector(
    (state) => state.global.hoveredPropertyId
  );

  const {
    data: properties,
    isLoading,
    isError,
    refetch,
  } = useGetPropertiesQuery(filters);

  const handleFavoriteToggle = async (propertyId: number) => {
    if (!authUser) return;

    const isFavorite = tenant?.favorites?.some(
      (fav: Property) => fav.id === propertyId
    );

    if (isFavorite) {
      await removeFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
    } else {
      await addFavorite({
        cognitoId: authUser.cognitoInfo.userId,
        propertyId,
      });
    }
  };

  const handleResetFilters = () => {
    dispatch(setFilters(initialState.filters));
  };

  if (isLoading) return <ListingsSkeleton />;

  if (isError || !properties) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-2xl border border-red-100 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">
          Failed to load properties
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          We encountered an issue fetching listings from the server. Please check your network and try again.
        </p>
        <Button
          onClick={() => refetch()}
          size="sm"
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold px-4 cursor-pointer"
        >
          Retry Search
        </Button>
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-900 text-base">
          No accommodations found
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {filters.location
            ? `No verified listings matched "${filters.location}". Try broadening your search or resetting active filters.`
            : "No listings currently match your selected filters. Try adjusting price, campus zone, or amenities."}
        </p>
        <Button
          onClick={handleResetFilters}
          variant="outline"
          size="sm"
          className="rounded-xl border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 py-2 flex justify-between items-center text-xs">
        <span className="font-bold text-slate-900">
          {properties.length}{" "}
          <span className="text-slate-500 font-normal">
            verified {properties.length === 1 ? "accommodation" : "accommodations"} available
          </span>
        </span>
        {filters.location && (
          <span className="text-slate-500">
            in <strong className="text-slate-800">{filters.location}</strong>
          </span>
        )}
      </div>

      <div className="p-4 w-full">
        {properties.map((property) => (
          <div
            key={property.id}
            onMouseEnter={() => dispatch(setHoveredPropertyId(property.id))}
            onMouseLeave={() => dispatch(setHoveredPropertyId(null))}
          >
            {viewMode === "grid" ? (
              <Card
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
                isHovered={hoveredPropertyId === property.id}
              />
            ) : (
              <CardCompact
                property={property}
                isFavorite={
                  tenant?.favorites?.some(
                    (fav: Property) => fav.id === property.id
                  ) || false
                }
                onFavoriteToggle={() => handleFavoriteToggle(property.id)}
                showFavoriteButton={!!authUser}
                propertyLink={`/search/${property.id}`}
                isHovered={hoveredPropertyId === property.id}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Listings;
