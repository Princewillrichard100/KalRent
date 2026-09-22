"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ShieldCheck, Sparkles, User, ShieldAlert, Award } from "lucide-react";
import React from "react";

interface ListingInfoProps {
  user?: {
    name?: string;
    image?: string;
    email?: string;
  } | null;
  description: string;
  bedCount: number;
  bathCount: number;
  category?: {
    label: string;
    description: string;
  };
  amenities?: string[];
  propertyType?: string;
}

export const ListingInfo: React.FC<ListingInfoProps> = ({
  user,
  description,
  bedCount,
  bathCount,
  category,
  amenities = [],
  propertyType,
}) => {
  return (
    <div className="col-span-4 flex flex-col gap-8">
      {/* Manager / Host profile header */}
      <div className="flex flex-row items-center justify-between pb-6 border-b border-neutral-200">
        <div className="flex flex-col gap-1">
          <div className="text-xl font-bold text-neutral-900">
            Hosted by {user?.name || "Verified Host"}
          </div>
          <div className="flex flex-row items-center gap-3 font-light text-neutral-500 text-xs">
            <span>{bedCount} {bedCount === 1 ? "Bedroom" : "Bedrooms"}</span>
            <span>•</span>
            <span>{bathCount} {bathCount === 1 ? "Bathroom" : "Bathrooms"}</span>
            <span>•</span>
            <span className="text-rose-500 font-semibold flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Superhost
            </span>
          </div>
        </div>

        <Avatar className="w-14 h-14 border border-neutral-200">
          <AvatarImage src={user?.image} />
          <AvatarFallback className="bg-rose-500 text-white text-base font-bold">
            {user?.name?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Category highlight banner */}
      <div className="flex flex-row items-start gap-4 pb-6 border-b border-neutral-200">
        <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 shrink-0">
          <Sparkles className="w-6 h-6" />
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-bold text-neutral-900">
            {category?.label || propertyType || "Entire Place"}
          </div>
          <div className="text-neutral-500 text-xs mt-0.5 leading-relaxed">
            {category?.description ||
              "Verified residential accommodation with quality living and safety inspection standards."}
          </div>
        </div>
      </div>

      {/* KalRent Cover Guarantee Card */}
      <div className="pb-6 border-b border-neutral-200">
        <div className="flex items-center gap-1 mb-2">
          <span className="text-lg font-black text-rose-500 tracking-tight">kalrent</span>
          <span className="text-lg font-black text-neutral-900 tracking-tight">cover</span>
        </div>
        <p className="text-xs text-neutral-500 leading-relaxed max-w-xl">
          Every booking includes free protection from Host cancellations, listing inaccuracies, and other issues like trouble checking in.
        </p>
      </div>

      {/* Rich Description */}
      <div className="pb-6 border-b border-neutral-200">
        <h3 className="text-base font-bold text-neutral-900 mb-3">About this space</h3>
        <p className="text-xs text-neutral-600 leading-relaxed whitespace-pre-line">
          {description || "No specific description provided by the host."}
        </p>
      </div>

      {/* Amenities Grid */}
      <div>
        <h3 className="text-base font-bold text-neutral-900 mb-4">What this place offers</h3>
        <div className="grid grid-cols-2 gap-3">
          {amenities.length > 0 ? (
            amenities.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 text-xs text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-100"
              >
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium">{item}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutral-400">Essential amenities included.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingInfo;
