import React from "react";
import { NeighborhoodData } from "@/lib/seo/constants";
import { Zap, CloudRain, Navigation, GraduationCap, CheckCircle2, Shield } from "lucide-react";

interface NeighborhoodVibeBlockProps {
  neighborhood: NeighborhoodData;
}

export default function NeighborhoodVibeBlock({
  neighborhood,
}: NeighborhoodVibeBlockProps) {
  const isBandA = neighborhood.powerBand.includes("Band A");

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 p-6 md:p-8 shadow-sm">
      <div className="flex items-center justify-between pb-6 border-b border-neutral-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700">
              <Navigation className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900">
              Neighborhood Vibe & Logistics: {neighborhood.city}
            </h3>
          </div>
          <p className="text-sm text-neutral-500 mt-1">
            Ground-truth living conditions verified by KalRent neighborhood inspectors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-6">
        {/* Power Availability */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
            <Zap className={`w-4 h-4 ${isBandA ? "text-amber-500" : "text-neutral-400"}`} />
            <span>Power Reliability</span>
          </div>
          <div className="font-bold text-neutral-900 text-sm">
            {neighborhood.powerBand}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {isBandA ? "Eligible for priority feeder grid power." : "Standard distribution with estate generator backups."}
          </p>
        </div>

        {/* Flood Risk */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
            <CloudRain className="w-4 h-4 text-cyan-600" />
            <span>Flood Risk Index</span>
          </div>
          <div className="font-bold text-neutral-900 text-sm">
            {neighborhood.floodRisk}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Verified drainage topography during heavy rainfall season.
          </p>
        </div>

        {/* Transit & Commute */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
            <Navigation className="w-4 h-4 text-indigo-600" />
            <span>Transit Corridor</span>
          </div>
          <div className="font-bold text-neutral-900 text-sm truncate">
            {neighborhood.transitHub}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Rapid access to major expressway links and public transit.
          </p>
        </div>

        {/* Campus Proximity or Security */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
            {neighborhood.campusProximity ? (
              <GraduationCap className="w-4 h-4 text-emerald-600" />
            ) : (
              <Shield className="w-4 h-4 text-emerald-600" />
            )}
            <span>{neighborhood.campusProximity ? "Campus Axis" : "Security Rating"}</span>
          </div>
          <div className="font-bold text-neutral-900 text-sm truncate">
            {neighborhood.campusProximity || "Gated Estate Patrols"}
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            {neighborhood.campusProximity ? "Ideal for students and academic staff." : "24/7 security checkpoint verification."}
          </p>
        </div>
      </div>

      {/* Highlights checklist */}
      <div className="pt-4 border-t border-neutral-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
          Neighborhood Highlights
        </h4>
        <div className="flex flex-wrap gap-2">
          {neighborhood.highlights.map((h, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-800 text-xs font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {h}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
