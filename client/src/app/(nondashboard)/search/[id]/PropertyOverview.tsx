"use client";

import { useGetPropertyQuery } from "@/state/api";
import { MapPin, Star, ShieldCheck, CheckCircle2 } from "lucide-react";
import React from "react";

const PropertyOverview = ({ propertyId }: PropertyOverviewProps) => {
  const {
    data: property,
    isError,
    isLoading,
  } = useGetPropertyQuery(propertyId);

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4"></div>
        <div className="h-8 bg-slate-200 rounded w-1/2"></div>
        <div className="h-24 bg-slate-100 rounded-2xl"></div>
      </div>
    );
  }

  if (isError || !property) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-2xl border border-red-200 text-sm font-semibold">
        Property information unavailable or does not exist.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-xs text-slate-500 mb-2 flex items-center gap-1.5 font-medium">
          <span>{property.location?.country || "Nigeria"}</span>
          <span>/</span>
          <span>{property.location?.state || "Kwara"}</span>
          <span>/</span>
          <span className="font-semibold text-slate-700">
            {property.location?.city || "Ilorin"}
          </span>
          <span>/</span>
          <span className="text-emerald-700 font-semibold">{property.campusZone}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
          {property.name}
        </h1>

        <div className="flex flex-wrap justify-between items-center gap-3 text-xs">
          <span className="flex items-center text-slate-600 font-medium">
            <MapPin className="w-4 h-4 mr-1.5 text-emerald-600 shrink-0" />
            {property.landmark ? `${property.landmark}, ` : ""}
            {property.campusZone}, {property.location?.city || "Ilorin"}
          </span>

          <div className="flex items-center gap-3">
            <span className="flex items-center text-slate-700 font-bold bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
              <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
              {property.averageRating.toFixed(1)}
              <span className="text-slate-400 font-normal ml-1">
                ({property.numberOfReviews} reviews)
              </span>
            </span>

            <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Listing
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 text-center">
          <div className="pt-2 sm:pt-0">
            <div className="text-xs text-slate-500 font-medium">Annual Rent</div>
            <div className="text-base font-extrabold text-slate-900 mt-0.5">
              ₦{property.annualRent?.toLocaleString()}
              <span className="text-xs text-slate-500 font-normal"> /yr</span>
            </div>
          </div>
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <div className="text-xs text-slate-500 font-medium">Campus Zone</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{property.campusZone}</div>
          </div>
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <div className="text-xs text-slate-500 font-medium">Bedrooms</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{property.beds} Bed</div>
          </div>
          <div className="pt-2 sm:pt-0 sm:pl-4">
            <div className="text-xs text-slate-500 font-medium">Bathrooms</div>
            <div className="text-sm font-bold text-slate-800 mt-0.5">{property.baths} Bath</div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-3 pt-2">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight">About this Hostel</h2>
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
          {property.description || "No detailed description provided for this accommodation."}
        </p>
      </div>
    </div>
  );
};

export default PropertyOverview;
