"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, ShieldCheck, Sparkles, User } from "lucide-react";
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
    <div className="col-span-4 flex flex-col gap-6">
      {/* Manager / Host info */}
      <div className="flex flex-col gap-2">
        <div className="text-lg font-bold flex flex-row items-center gap-3 text-slate-900">
          <div>Hosted by {user?.name || "Verified Property Manager"}</div>
          <Avatar className="w-9 h-9 border border-slate-200">
            <AvatarImage src={user?.image} />
            <AvatarFallback className="bg-rose-500 text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex flex-row items-center gap-4 font-light text-slate-500 text-xs">
          <div>{bedCount} {bedCount === 1 ? "Bedroom" : "Bedrooms"}</div>
          <div>•</div>
          <div>{bathCount} {bathCount === 1 ? "Bathroom" : "Bathrooms"}</div>
          <div>•</div>
          <div className="text-emerald-700 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> BaaS Escrow Protected
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Category feature callout */}
      <div className="flex flex-row items-start gap-4">
        <div className="p-2.5 bg-rose-50 rounded-xl text-rose-500 shrink-0">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-bold text-slate-900">
            {category?.label || propertyType || "Student Accommodation"}
          </div>
          <div className="text-slate-500 text-xs mt-0.5">
            {category?.description ||
              "Verified student rental adhering to Kwara State Tenancy Guidelines."}
          </div>
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* Description */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-2">About this place</h3>
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
          {description || "No specific description provided by the manager."}
        </p>
      </div>

      <hr className="border-slate-100" />

      {/* Amenities */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-3">What this hostel offers</h3>
        <div className="grid grid-cols-2 gap-2.5">
          {amenities.length > 0 ? (
            amenities.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{item}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400">Essential student amenities included.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListingInfo;
