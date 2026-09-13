"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import {
  useGetAuthUserQuery,
  useGetPropertiesQuery,
  useGetTenantQuery,
} from "@/state/api";
import { Heart, Search } from "lucide-react";
import Link from "next/link";
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
      <Header
        title="Saved Hostels"
        subtitle="Browse and compare your shortlisted student properties"
      />
      {hasFavorites ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favoriteProperties.map((property) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={true}
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/search/${property.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Heart className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No saved hostels yet</h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Shortlist hostels near Tanke, Sanrab, OkeOdo, or Jalala to easily compare fees, proximity, and amenities later.
          </p>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Explore Campus Listings</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Favorites;
