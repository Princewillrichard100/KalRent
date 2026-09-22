"use client";

import ListingCard from "@/components/listings/ListingCard";
import Heading from "@/components/Heading";
import EmptyState from "@/components/EmptyState";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";

const Favorites = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  const {
    data: favoriteProperties,
    isLoading,
    error,
  } = useGetPropertiesQuery(
    { favoriteIds: tenant?.favorites?.map((fav: { id: number }) => fav.id) },
    { skip: !tenant?.favorites || tenant?.favorites.length === 0 }
  );

  if (isLoading) return <Loading />;
  if (error) {
    return (
      <div className="dashboard-container py-12 text-center">
        <h3 className="text-lg font-bold text-slate-900">Failed to load saved properties</h3>
        <p className="text-sm text-slate-500 mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  const hasFavorites = favoriteProperties && favoriteProperties.length > 0;

  return (
    <div className="dashboard-container space-y-6">
      <Heading
        title="Favorites"
        subtitle="List of places you favorited!"
      />
      {hasFavorites ? (
        <div 
          className="
            mt-6
            grid 
            grid-cols-1 
            sm:grid-cols-2 
            md:grid-cols-3 
            lg:grid-cols-4 
            xl:grid-cols-5
            2xl:grid-cols-6
            gap-8
          "
        >
          {favoriteProperties.map((property) => (
            <ListingCard
              key={property.id}
              data={property}
              currentUser={authUser}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No favorites found"
          subtitle="Looks like you have no favorite listings."
        />
      )}
    </div>
  );
};

export default Favorites;
