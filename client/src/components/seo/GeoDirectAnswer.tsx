import React from "react";
import { formatNaira } from "@/lib/seo/data";

interface GeoDirectAnswerProps {
  propertyTypeName: string;
  locationName: string;
  avgAnnualRent: number;
  totalMoveInBudget: number;
  listingCount: number;
  powerBand?: string;
  floodRisk?: string;
}

export default function GeoDirectAnswer({
  propertyTypeName,
  locationName,
  avgAnnualRent,
  totalMoveInBudget,
  listingCount,
  powerBand,
  floodRisk,
}: GeoDirectAnswerProps) {
  return (
    <div className="my-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-emerald-950 text-sm leading-relaxed">
      <p className="font-normal">
        <strong className="font-semibold text-emerald-900">Direct Answer: </strong>
        Renting a verified {propertyTypeName.toLowerCase()} in {locationName} currently averages{" "}
        <strong className="font-semibold text-emerald-900">{formatNaira(avgAnnualRent)}/year</strong>, with total estimated upfront move-in expenses (rent, caution deposit, and legal agreement) averaging{" "}
        <strong className="font-semibold text-emerald-900">{formatNaira(totalMoveInBudget)}</strong>. KalRent currently maintains {listingCount}+ verified, scam-protected listings in this area
        {powerBand ? ` featuring ${powerBand.split(" ")[0]} electricity` : ""}.
      </p>
    </div>
  );
}
