"use client";

import Card from "@/components/Card";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { EnterpriseTenancyCard } from "@/components/EnterpriseTenancyCard";
import {
  useGetAuthUserQuery,
  useGetCurrentResidencesQuery,
  useGetLeasesQuery,
  useGetTenantQuery,
} from "@/state/api";
import React from "react";

const Residences = () => {
  const { data: authUser } = useGetAuthUserQuery();
  const { data: tenant } = useGetTenantQuery(
    authUser?.cognitoInfo?.userId || "",
    {
      skip: !authUser?.cognitoInfo?.userId,
    }
  );

  const {
    data: currentResidences,
    isLoading: isResidencesLoading,
    error,
  } = useGetCurrentResidencesQuery(authUser?.cognitoInfo?.userId || "", {
    skip: !authUser?.cognitoInfo?.userId,
  });

  const { data: leases, isLoading: isLeasesLoading } = useGetLeasesQuery(0, {
    skip: !authUser?.cognitoInfo?.userId,
  });

  if (isResidencesLoading || isLeasesLoading) return <Loading />;
  if (error) return <div>Error loading current residences</div>;

  const activeLeases =
    leases?.filter(
      (l) =>
        l.status === "ACTIVE" &&
        (l.tenantCognitoId === authUser?.cognitoInfo?.userId ||
          !l.tenantCognitoId)
    ) || [];

  return (
    <div className="dashboard-container space-y-8">
      <Header
        title="Current Residences"
        subtitle="View and manage your current living spaces and active tenancies"
      />

      {/* Active Tenancy Cards */}
      {activeLeases.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800">
            Active Lease & Escrow Lifecycle
          </h2>
          <div className="grid grid-cols-1 gap-6">
            {activeLeases.map((lease) => (
              <EnterpriseTenancyCard
                key={lease.id}
                leaseId={lease.id}
                propertyName={lease.property?.name}
                propertyAddress={lease.property?.location?.address}
              />
            ))}
          </div>
        </div>
      )}

      {/* Property Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800">
          Residence Properties
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentResidences?.map((property) => (
            <Card
              key={property.id}
              property={property}
              isFavorite={
                tenant?.favorites?.some(
                  (fav: { id: number }) => fav.id === property.id
                ) || false
              }
              onFavoriteToggle={() => {}}
              showFavoriteButton={false}
              propertyLink={`/tenants/residences/${property.id}`}
            />
          ))}
        </div>
        {(!currentResidences || currentResidences.length === 0) &&
          activeLeases.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-sm">
              You don&apos;t have any active residences or leases currently.
            </div>
          )}
      </div>
    </div>
  );
};

export default Residences;
