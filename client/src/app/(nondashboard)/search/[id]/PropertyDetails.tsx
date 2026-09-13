"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AmenityIcons, HighlightIcons } from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import { useGetPropertyQuery } from "@/state/api";
import { HelpCircle, ShieldCheck } from "lucide-react";
import React from "react";

const PropertyDetails = ({ propertyId }: PropertyDetailsProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (isError || !property) {
    return null;
  }

  const totalUpfront =
    (property.annualRent || 0) +
    (property.agentFee || 0) +
    (property.cautionDeposit || 0) +
    (property.platformFee || 0);

  return (
    <div className="space-y-10 mb-6">
      {/* Amenities */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 tracking-tight mb-4">
          Hostel Amenities
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {property.amenities.map((amenity: AmenityEnum) => {
            const Icon = AmenityIcons[amenity as AmenityEnum] || HelpCircle;
            return (
              <div
                key={amenity}
                className="flex items-center gap-3 p-3.5 border border-slate-200/80 bg-white rounded-xl shadow-2xs hover:border-emerald-300 transition-colors"
              >
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700">
                  {formatEnumString(amenity)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Highlights */}
      {property.highlights && property.highlights.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-4">
            Highlights &amp; Advantages
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {property.highlights.map((highlight: HighlightEnum) => {
              const Icon =
                HighlightIcons[highlight as HighlightEnum] || HelpCircle;
              return (
                <div
                  key={highlight}
                  className="flex items-center gap-3 p-3.5 border border-slate-200/80 bg-white rounded-xl shadow-2xs hover:border-emerald-300 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-teal-50 text-teal-700 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {formatEnumString(highlight)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Upfront Breakdown & Policies */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Upfront Costs &amp; Tenancy Policies
        </h3>
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          All caution deposits are held safely in BaaS escrow under Kwara State Tenancy Laws.
        </p>

        <Tabs defaultValue="breakdown" className="mt-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="breakdown" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-2xs">
              Fee Schedule
            </TabsTrigger>
            <TabsTrigger value="policies" className="rounded-lg text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-slate-900 shadow-2xs">
              Campus Policies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="w-full max-w-md mt-4">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Annual Base Rent</span>
                <span className="font-bold text-slate-900">₦{property.annualRent?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Agent Commission (Capped 10%)</span>
                <span className="font-bold text-slate-900">₦{property.agentFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Caution Deposit (Refundable Escrow)</span>
                <span className="font-bold text-emerald-700">₦{property.cautionDeposit?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-200">
                <span className="text-slate-600 font-medium">Platform &amp; Legal Verification (5%)</span>
                <span className="font-bold text-slate-900">₦{property.platformFee?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 bg-emerald-100/60 px-3 rounded-xl mt-2 text-emerald-950">
                <span className="font-bold">Total Upfront Required</span>
                <span className="text-sm font-black">₦{totalUpfront.toLocaleString()}</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="policies" className="w-full max-w-md mt-4 space-y-2.5 text-xs">
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Designated Campus Zone</span>
              <p className="text-slate-600">{property.campusZone} Student District</p>
            </div>
            {property.landmark && (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="font-bold text-slate-800 block">Nearest Landmark</span>
                <p className="text-slate-600">{property.landmark}</p>
              </div>
            )}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="font-bold text-slate-800 block">Vehicle Parking</span>
              <p className="text-slate-600">
                {property.isParkingIncluded ? "Dedicated student parking available on premises" : "Street parking only"}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PropertyDetails;
