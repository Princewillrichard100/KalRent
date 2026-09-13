"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import { Building2, Plus, Home } from "lucide-react";
import Link from "next/link";
import React from "react";

const Properties = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const {
    data: managerProperties,
    isLoading,
    error,
  } = useGetManagerPropertiesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  if (isLoading) return <Loading />;
  if (error) {
    return (
      <div className="dashboard-container py-12 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-50 text-rose-600 mb-4">
          <Building2 className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Failed to load properties</h3>
        <p className="text-sm text-slate-500 mt-1">Please check your connection and refresh.</p>
      </div>
    );
  }

  const hasProperties = managerProperties && managerProperties.length > 0;

  return (
    <div className="dashboard-container space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Header
          title="My Properties"
          subtitle="View and manage your student hostels and property listings"
        />
        <Link
          href="/managers/newproperty"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Property</span>
        </Link>
      </div>

      {hasProperties ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {managerProperties.map((property) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={false}
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/managers/properties/${property.id}`}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Home className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No properties listed yet</h3>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            You haven&apos;t added any hostels or student rentals yet. Create your first listing to start accepting verified student tenant applications.
          </p>
          <Link
            href="/managers/newproperty"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 mt-6 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Listing</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Properties;
