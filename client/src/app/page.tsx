"use client";

import React, { useMemo } from "react";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import ListingSectionRow, { SectionData } from "@/components/listings/ListingSectionRow";
import ListingCard from "@/components/listings/ListingCard";
import { useGetAuthUserQuery, useGetPropertiesQuery } from "@/state/api";
import { useUserLocation } from "@/hooks/useUserLocation";
import EmptyState from "@/components/EmptyState";

export default function Home() {
  const { data: authUser } = useGetAuthUserQuery();
  const userCoords = useUserLocation();

  const { data: properties, isLoading, isError } = useGetPropertiesQuery({
    userLat: userCoords?.lat,
    userLng: userCoords?.lng,
    sortBy: "newest",
  } as any);

  // Group properties into regional/thematic Nigerian collections
  const sections = useMemo<SectionData[]>(() => {
    if (!properties || properties.length === 0) return [];

    const ikejaCentral = properties.filter((p) => {
      const addr = (p.location?.address || "").toLowerCase();
      const city = (p.location?.city || "").toLowerCase();
      return (
        addr.includes("ikeja") ||
        addr.includes("surulere") ||
        addr.includes("yaba") ||
        city.includes("ikeja")
      );
    });

    const lekkiCoastal = properties.filter((p) => {
      const addr = (p.location?.address || "").toLowerCase();
      const city = (p.location?.city || "").toLowerCase();
      return (
        addr.includes("lekki") ||
        addr.includes("victoria island") ||
        addr.includes("ikoyi")
      );
    });

    const ibadanStays = properties.filter((p) => {
      const city = (p.location?.city || "").toLowerCase();
      const addr = (p.location?.address || "").toLowerCase();
      return (
        city.includes("ibadan") ||
        addr.includes("bodija") ||
        addr.includes("agodi") ||
        addr.includes("oluyole")
      );
    });

    const ogunRetreats = properties.filter((p) => {
      const state = (p.location?.state || "").toLowerCase();
      const city = (p.location?.city || "").toLowerCase();
      const addr = (p.location?.address || "").toLowerCase();
      return (
        state.includes("ogun") ||
        city.includes("ogun") ||
        addr.includes("arepo") ||
        addr.includes("mowe") ||
        addr.includes("magboro")
      );
    });

    const luxuryVillas = properties.filter((p) => {
      return (
        p.propertyType === "Villa" ||
        p.propertyType === "Townhouse" ||
        p.annualRent >= 8_000_000
      );
    });

    return [
      {
        title: "Stay in Ikeja & Central Lagos",
        subtitle: "Close to tech hubs, nightlife, and the airport",
        location: "Ikeja",
        placeId: "hub_Ikeja",
        lat: 6.5965,
        lng: 3.3421,
        listings: ikejaCentral.length ? ikejaCentral : properties.slice(0, 8),
      },
      {
        title: "Available in Lekki & Coastal Lagos",
        subtitle: "Luxury coastal homes, beach access, and prime estates",
        location: "Lekki",
        placeId: "hub_Lekki",
        lat: 6.4449,
        lng: 3.4691,
        listings: lekkiCoastal.length ? lekkiCoastal : properties.slice(8, 16),
      },
      {
        title: "Top stays in Bodija & Agodi, Ibadan",
        subtitle: "Historic estates and peaceful getaways along the corridor",
        location: "Ibadan",
        placeId: "hub_Ibadan",
        lat: 7.4289,
        lng: 3.9100,
        listings: ibadanStays.length ? ibadanStays : properties.slice(16, 24),
      },
      {
        title: "Peaceful retreats in Ogun State",
        subtitle: "Gated communities in Arepo, Magboro & Mowe",
        location: "Ogun",
        placeId: "hub_Ogun",
        lat: 6.6908,
        lng: 3.4475,
        listings: ogunRetreats.length ? ogunRetreats : properties.slice(24, 32),
      },
      {
        title: "Luxury Villas & Executive Penthouses",
        subtitle: "Premium residences with private pools and full amenities",
        location: "all",
        placeId: "hub_Luxury",
        lat: 6.4531,
        lng: 3.4395,
        listings: luxuryVillas.length ? luxuryVillas : properties.slice(0, 10),
      },
    ];
  }, [properties]);

  return (
    <div className="h-full w-full min-h-screen bg-white">
      <Navbar />

      <main className="h-full w-full pt-28 md:pt-44 pb-20">
        <Container>
          {isLoading ? (
            <div className="flex flex-col space-y-4">
              {[1, 2, 3].map((idx) => (
                <ListingSectionRow key={idx} isLoading={true} />
              ))}
            </div>
          ) : isError || !properties || properties.length === 0 ? (
            <EmptyState
              title="No properties available"
              subtitle="Please check back soon for verified rentals across Nigeria."
              showReset
            />
          ) : (
            <div className="flex flex-col space-y-4">
              {sections.map((section, idx) => (
                <ListingSectionRow
                  key={idx}
                  section={section}
                  currentUser={authUser}
                />
              ))}
            </div>
          )}
        </Container>
      </main>
    </div>
  );
}
