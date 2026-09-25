import React from "react";
import { Property } from "@/types/prismaTypes";
import ListingCard from "@/components/listings/ListingCard";
import Link from "next/link";
import { Search, ShieldAlert, ArrowRight } from "lucide-react";

interface ProgrammaticListingFeedProps {
  properties: Property[];
  locationName: string;
  propertyTypeName: string;
  searchUrl: string;
}

export default function ProgrammaticListingFeed({
  properties,
  locationName,
  propertyTypeName,
  searchUrl,
}: ProgrammaticListingFeedProps) {
  if (properties.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-8 text-center max-w-2xl mx-auto my-8 shadow-sm">
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <Search className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">
          New Verified {propertyTypeName} Listings Coming Soon in {locationName}
        </h3>
        <p className="text-sm text-neutral-600 mb-6 leading-relaxed">
          KalRent rigorously inspects and title-checks every landlord before publishing. Unlike legacy classified sites, we reject ghost listings and fake agent adverts.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={searchUrl}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 text-white font-semibold text-sm hover:bg-neutral-800 transition"
          >
            <span>Search Live Map for Nearby Homes</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/rent"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-xl border border-neutral-200 text-neutral-700 font-semibold text-sm hover:bg-neutral-50 transition"
          >
            Browse All Locations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="listings-feed" className="my-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-neutral-900">
            Available {propertyTypeName} in {locationName}
          </h3>
          <p className="text-sm text-neutral-500 mt-1">
            {properties.length} verified listings available with KalRent Escrow protection.
          </p>
        </div>
        <Link
          href={searchUrl}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-4"
        >
          View on Split Map →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <ListingCard key={property.id} data={property} />
        ))}
      </div>
    </div>
  );
}
