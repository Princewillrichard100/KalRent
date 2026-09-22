"use client";

import ListingCard from "@/components/listings/ListingCard";
import Heading from "@/components/Heading";
import EmptyState from "@/components/EmptyState";
import Loading from "@/components/Loading";
import { useGetAuthUserQuery, useGetManagerPropertiesQuery } from "@/state/api";
import { Building2 } from "lucide-react";
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
      <Heading
        title="Properties"
        subtitle="List of your properties!"
      />

      {hasProperties ? (
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
          {managerProperties.map((property) => (
            <ListingCard
              key={property.id}
              data={property}
              currentUser={authUser}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No properties found"
          subtitle="Looks like you have no properties listed."
        />
      )}
    </div>
  );
};

export default Properties;
