"use client";
import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { useGetPropertiesQuery } from "@/state/api";
import {
  setHoveredPropertyId,
  setSelectedPropertyId,
  setUserLocation,
} from "@/state";
import { PropertyWithDistance } from "@/state/api";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

const formatPricePill = (rent?: number) => {
  if (!rent) return "₦0";
  if (rent >= 1000000) {
    const val = rent / 1000000;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)}M`;
  }
  if (rent >= 1000) {
    return `₦${Math.round(rent / 1000)}k`;
  }
  return `₦${rent}`;
};

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: number]: { marker: mapboxgl.Marker; el: HTMLElement } }>({});
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);

  const dispatch = useAppDispatch();
  const filters = useAppSelector((state) => state.global.filters);
  const hoveredPropertyId = useAppSelector((state) => state.global.hoveredPropertyId);
  const selectedPropertyId = useAppSelector((state) => state.global.selectedPropertyId);

  const {
    data: properties,
    isLoading,
    isError,
  } = useGetPropertiesQuery(filters);

  // Initialize Mapbox map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialCenter: [number, number] =
      filters.userLng && filters.userLat
        ? [filters.userLng, filters.userLat]
        : filters.coordinates || [4.5901, 8.4799];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: initialCenter,
      zoom: 12,
    });

    mapRef.current = map;

    // Navigation Controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Native GeolocateControl
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });

    geolocate.on("geolocate", (e: any) => {
      const lat = e.coords?.latitude;
      const lng = e.coords?.longitude;
      if (lat && lng) {
        dispatch(setUserLocation({ lat, lng }));
      }
    });

    map.addControl(geolocate, "top-right");
    geolocateControlRef.current = geolocate;

    // Expose programmatic trigger for quick-action buttons
    const handleTriggerGeolocate = () => {
      geolocate.trigger();
    };
    window.addEventListener("trigger-mapbox-geolocate", handleTriggerGeolocate);

    // Initial resize safety
    setTimeout(() => map.resize(), 500);

    return () => {
      window.removeEventListener("trigger-mapbox-geolocate", handleTriggerGeolocate);
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render & update custom Airbnb-style price pill markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || isLoading || isError || !properties) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach(({ marker }) => marker.remove());
    markersRef.current = {};

    const bounds = new mapboxgl.LngLatBounds();
    let hasCoords = false;

    if (filters.userLng && filters.userLat) {
      bounds.extend([filters.userLng, filters.userLat]);
      hasCoords = true;
    }

    properties.forEach((property: PropertyWithDistance) => {
      const lng = property.location?.coordinates?.longitude;
      const lat = property.location?.coordinates?.latitude;

      if (lng === undefined || lat === undefined || (lng === 0 && lat === 0)) return;

      bounds.extend([lng, lat]);
      hasCoords = true;

      // Create Custom HTML Price Pill Marker
      const pillEl = document.createElement("div");
      pillEl.className = "airbnb-marker-pill";
      pillEl.id = `map-marker-${property.id}`;
      pillEl.innerHTML = `<span>${formatPricePill(property.annualRent)}</span>`;

      // Micro-card popup content
      const thumbnail = property.photoUrls?.[0] || "/placeholder.jpg";
      const distanceBadge =
        property.distanceKm !== undefined
          ? `<span class="airbnb-popup-distance flex items-center gap-1"><svg class="w-3 h-3 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${property.distanceKm} km away</span>`
          : "";

      const popupHTML = `
        <div class="airbnb-popup-card">
          <div class="airbnb-popup-img-wrap">
            <img src="${thumbnail}" alt="${property.name}" class="airbnb-popup-img" onerror="this.src='/placeholder.jpg'" />
            ${distanceBadge}
          </div>
          <div class="airbnb-popup-info">
            <div class="airbnb-popup-zone">${property.campusZone || "Ilorin Campus Area"}</div>
            <a href="/search/${property.id}" class="airbnb-popup-title">${property.name}</a>
            <div class="airbnb-popup-price">
              ₦${property.annualRent?.toLocaleString()}
              <span class="text-xs text-slate-500 font-normal">/yr</span>
            </div>
            <div class="airbnb-popup-meta">${property.beds} beds • ${property.baths} baths</div>
          </div>
        </div>
      `;

      const popup = new mapboxgl.Popup({
        offset: 18,
        closeButton: true,
        closeOnClick: false,
      }).setHTML(popupHTML);

      // Mouse hover sync
      pillEl.addEventListener("mouseenter", () => {
        dispatch(setHoveredPropertyId(property.id));
      });
      pillEl.addEventListener("mouseleave", () => {
        dispatch(setHoveredPropertyId(null));
      });

      // Click sync: Fly to marker & smooth-scroll listing feed
      pillEl.addEventListener("click", (e) => {
        e.stopPropagation();
        dispatch(setSelectedPropertyId(property.id));

        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 14),
          duration: 900,
        });

        // Smooth scroll listing card into center view
        const listingEl = document.getElementById(`property-${property.id}`);
        if (listingEl) {
          listingEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      const marker = new mapboxgl.Marker({ element: pillEl })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current[property.id] = { marker, el: pillEl };
    });

    // Fit map bounds cleanly between user location & listing locations
    if (hasCoords) {
      map.fitBounds(bounds, {
        padding: { top: 70, bottom: 70, left: 60, right: 60 },
        maxZoom: 14.5,
        duration: 1200,
      });
    }
  }, [properties, isLoading, isError, filters.userLat, filters.userLng]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync hovered property from listing feed to Mapbox markers
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([idStr, { el }]) => {
      const id = Number(idStr);
      if (id === hoveredPropertyId) {
        el.classList.add("is-hovered");
      } else {
        el.classList.remove("is-hovered");
      }

      if (id === selectedPropertyId) {
        el.classList.add("is-selected");
      } else {
        el.classList.remove("is-selected");
      }
    });
  }, [hoveredPropertyId, selectedPropertyId]);

  if (isLoading) return <div className="p-4 text-sm text-slate-500">Loading interactive map...</div>;
  if (isError || !properties) return <div className="p-4 text-sm text-red-500">Failed to load property locations</div>;

  return (
    <div className="basis-5/12 grow relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
      <div
        className="map-container rounded-2xl"
        ref={mapContainerRef}
        style={{
          height: "100%",
          width: "100%",
        }}
      />
    </div>
  );
};

export default Map;
