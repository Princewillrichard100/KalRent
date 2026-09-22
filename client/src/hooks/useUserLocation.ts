"use client";

import { useState, useEffect } from "react";

export interface UserCoordinates {
  lat: number;
  lng: number;
  source: "gps" | "edge_fallback";
}

export function useUserLocation(edgeFallback?: { lat: number; lng: number }) {
  const [coords, setCoords] = useState<UserCoordinates | null>(() => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem("kalrent_user_coords");
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        return null;
      }
    }
    return edgeFallback ? { ...edgeFallback, source: "edge_fallback" } : null;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc: UserCoordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          source: "gps",
        };
        setCoords(userLoc);
        try {
          localStorage.setItem("kalrent_user_coords", JSON.stringify(userLoc));
        } catch {
          // Ignore localStorage write failures in private browsing
        }
      },
      (err) => {
        console.warn("Geolocation permission not granted; staying on fallback.", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 1000 * 60 * 15, // 15 mins cache
      }
    );
  }, []);

  return coords;
}

export default useUserLocation;
