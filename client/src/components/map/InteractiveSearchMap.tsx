"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { Property } from "@/types/prismaTypes";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

export interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export interface ViewportBounds {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
}

interface InteractiveSearchMapProps {
  listings: (Property & {
    distanceKm?: number;
    distance_km?: number;
    city?: string;
    state?: string;
  })[];
  selectedListing: any | null;
  onSelectListing: (listing: any | null) => void;
  center?: [number, number]; // [lat, lng]
  onBoundsChange?: (bounds: ViewportBounds) => void;
  onSearchArea?: (bbox: BoundingBox) => void;
  isSearchingArea?: boolean;
  locationAnchor?: { name: string; lat: number; lng: number } | null;
}

export const formatPricePill = (rent?: number) => {
  if (!rent) return "₦0";
  if (rent >= 1_000_000) {
    const val = rent / 1_000_000;
    return `₦${val % 1 === 0 ? val : val.toFixed(1)}M`;
  }
  if (rent >= 1_000) {
    return `₦${Math.round(rent / 1_000)}k`;
  }
  return `₦${rent.toLocaleString()}`;
};

const InteractiveSearchMapComponent: React.FC<InteractiveSearchMapProps> = ({
  listings,
  selectedListing,
  onSelectListing,
  center,
  onBoundsChange,
  onSearchArea,
  isSearchingArea = false,
  locationAnchor,
}) => {
  const router = useRouter();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [id: number]: { marker: mapboxgl.Marker; el: HTMLElement; wrapper: HTMLElement } }>({});
  const anchorMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const moveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasInitialFitRef = useRef(false);
  const isUserInteractingRef = useRef(false);

  const [isMapMoved, setIsMapMoved] = useState(false);
  const [currentBbox, setCurrentBbox] = useState<BoundingBox | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  const [isSmoothSearching, setIsSmoothSearching] = useState(isSearchingArea);
  const searchStartRef = useRef<number>(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isSearchingArea) {
      searchStartRef.current = Date.now();
      setIsSmoothSearching(true);
    } else {
      const elapsed = Date.now() - searchStartRef.current;
      const minDuration = 450;
      const remaining = Math.max(0, minDuration - elapsed);

      timeout = setTimeout(() => {
        setIsSmoothSearching(false);
      }, remaining);
    }

    return () => clearTimeout(timeout);
  }, [isSearchingArea]);

  const defaultLng = center?.[1] || 3.4219;
  const defaultLat = center?.[0] || 6.4531;

  useEffect(() => {
    setActivePhotoIdx(0);
  }, [selectedListing?.id]);

  // 1. Initialize Mapbox Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [defaultLng, defaultLat],
      zoom: 11,
      attributionControl: false,
      cooperativeGestures: true,
      scrollZoom: false,
    });

    mapRef.current = map;

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: true,
    });
    map.addControl(geolocate, "top-right");

    // Debounced moveend listener (350ms) to sync viewport bounds smoothly
    const handleMoveEnd = () => {
      isUserInteractingRef.current = true;
      if (moveTimerRef.current) {
        clearTimeout(moveTimerRef.current);
      }
      moveTimerRef.current = setTimeout(() => {
        const bounds = map.getBounds();
        if (!bounds) return;

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();

        if (onBoundsChange) {
          onBoundsChange({
            ne_lat: ne.lat,
            ne_lng: ne.lng,
            sw_lat: sw.lat,
            sw_lng: sw.lng,
          });
        }

        const bbox: BoundingBox = {
          minLng: sw.lng,
          minLat: sw.lat,
          maxLng: ne.lng,
          maxLat: ne.lat,
        };

        setCurrentBbox(bbox);
        setIsMapMoved(true);
      }, 350);
    };

    map.on("moveend", handleMoveEnd);

    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const timer = setTimeout(() => map.resize(), 300);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(timer);
      if (moveTimerRef.current) clearTimeout(moveTimerRef.current);
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Diff and Synchronize Custom Airbnb Price Pill Markers (Zero-Blink Diffing)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !listings) return;

    const currentMarkerIds = new Set(Object.keys(markersRef.current).map(Number));
    const newListingIds = new Set(listings.map((l) => l.id));

    // A. Remove markers that left the viewport
    currentMarkerIds.forEach((id) => {
      if (!newListingIds.has(id)) {
        markersRef.current[id]?.marker.remove();
        delete markersRef.current[id];
      }
    });

    // B. Add new markers (existing markers remain untouched and stable on screen)
    listings.forEach((listing) => {
      if (markersRef.current[listing.id]) {
        return; // Stable marker already present, keep it without blinking
      }

      const lng = listing.location?.coordinates?.longitude;
      const lat = listing.location?.coordinates?.latitude;

      if (lng === undefined || lat === undefined || (lng === 0 && lat === 0)) return;

      // 1. Outer Wrapper: Stationary hit target that NEVER transforms
      const wrapper = document.createElement("div");
      wrapper.className = "airbnb-marker-wrapper";
      wrapper.setAttribute("data-marker-id", listing.id.toString());

      // 2. Inner Pill: Handles visual styling, colors, and scale transforms
      const pill = document.createElement("div");
      pill.className = "airbnb-price-pill";
      pill.id = `map-marker-${listing.id}`;
      pill.setAttribute("data-marker-id", listing.id.toString());
      pill.innerHTML = `<span class="pointer-events-none">${formatPricePill(listing.annualRent)}</span>`;

      wrapper.appendChild(pill);

      // Attach hover listeners to STATIONARY wrapper (eliminates flicker loop)
      wrapper.addEventListener("mouseenter", () => {
        pill.classList.add("is-hovered");
        wrapper.style.zIndex = "999";
        const cardEl = document.getElementById(`listing-card-${listing.id}`);
        if (cardEl) cardEl.classList.add("is-hovered");
      });

      wrapper.addEventListener("mouseleave", () => {
        pill.classList.remove("is-hovered");
        wrapper.style.zIndex = "";
        const cardEl = document.getElementById(`listing-card-${listing.id}`);
        if (cardEl) cardEl.classList.remove("is-hovered");
      });

      // Click to select & open floating preview
      wrapper.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectListing(listing);

        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), 12.5),
          offset: [0, 90],
          duration: 600,
        });

        const cardEl = document.getElementById(`listing-card-${listing.id}`);
        if (cardEl) {
          cardEl.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      const marker = new mapboxgl.Marker({ element: wrapper, anchor: "center" })
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current[listing.id] = { marker, el: pill, wrapper } as any;
    });

    // C. Initial fitBounds ONCE only (never hijack or jerk camera during manual pan/zoom)
    if (!hasInitialFitRef.current && !isUserInteractingRef.current && listings.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidCoords = false;

      listings.forEach((listing) => {
        const lng = listing.location?.coordinates?.longitude;
        const lat = listing.location?.coordinates?.latitude;
        if (lng !== undefined && lat !== undefined && (lng !== 0 || lat !== 0)) {
          bounds.extend([lng, lat]);
          hasValidCoords = true;
        }
      });

      if (hasValidCoords) {
        hasInitialFitRef.current = true;
        map.fitBounds(bounds, {
          padding: { top: 80, bottom: 80, left: 60, right: 60 },
          maxZoom: 14,
          duration: 900,
        });
      }
    }
  }, [listings, onSelectListing]);

  // 3. Highlight selected marker
  useEffect(() => {
    Object.entries(markersRef.current).forEach(([idStr, entry]: [string, any]) => {
      const id = Number(idStr);
      const { el, wrapper } = entry;
      if (selectedListing && id === selectedListing.id) {
        el.classList.add("is-selected");
        if (wrapper) wrapper.style.zIndex = "999";
      } else {
        el.classList.remove("is-selected");
        if (wrapper && !el.classList.contains("is-hovered")) {
          wrapper.style.zIndex = "";
        }
      }
    });
  }, [selectedListing]);

  // 4. Synchronize Location Focus Anchor Marker (Airbnb speech-bubble badge with spring bounce)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!locationAnchor || !locationAnchor.name || !locationAnchor.lat || !locationAnchor.lng) {
      if (anchorMarkerRef.current) {
        anchorMarkerRef.current.remove();
        anchorMarkerRef.current = null;
      }
      return;
    }

    if (anchorMarkerRef.current) {
      anchorMarkerRef.current.remove();
      anchorMarkerRef.current = null;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "location-anchor-marker pointer-events-none select-none";
    wrapper.innerHTML = `
      <div class="flex flex-col items-center">
        <div class="animate-airbnb-bounce flex items-center gap-1.5 bg-white text-neutral-900 px-3 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.18)] border border-neutral-200/90 whitespace-nowrap">
          <svg class="w-3.5 h-3.5 text-neutral-900 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
          </svg>
          <span class="font-bold text-xs tracking-tight text-neutral-900">${locationAnchor.name}</span>
        </div>
        <div class="-mt-[1px] w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white filter drop-shadow-[0_2px_1px_rgba(0,0,0,0.08)]"></div>
      </div>
    `;

    const marker = new mapboxgl.Marker({ element: wrapper, anchor: "bottom" })
      .setLngLat([locationAnchor.lng, locationAnchor.lat])
      .addTo(map);

    anchorMarkerRef.current = marker;

    return () => {
      if (anchorMarkerRef.current) {
        anchorMarkerRef.current.remove();
        anchorMarkerRef.current = null;
      }
    };
  }, [locationAnchor]);

  const handleTriggerSearchArea = useCallback(() => {
    if (currentBbox && onSearchArea) {
      onSearchArea(currentBbox);
      setIsMapMoved(false);
    }
  }, [currentBbox, onSearchArea]);

  const photos = selectedListing?.photoUrls?.length ? selectedListing.photoUrls : ["/placeholder.jpg"];

  const handleNextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev + 1) % photos.length);
  };

  const handlePrevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActivePhotoIdx((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="w-full h-full relative overflow-hidden select-none">
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Searching Indicator / Search This Area */}
      {isSmoothSearching ? (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md text-neutral-800 font-semibold text-xs px-4 py-2 rounded-full shadow-lg border border-neutral-200/90">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-700" />
            <span>Searching map area...</span>
          </div>
        </div>
      ) : !onBoundsChange && isMapMoved && onSearchArea ? (
        <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30 animate-in fade-in slide-in-from-top-3 duration-200">
          <button
            type="button"
            onClick={handleTriggerSearchArea}
            className="
              flex items-center gap-2 
              bg-white hover:bg-neutral-50 
              text-neutral-900 
              font-semibold 
              text-xs 
              px-4 py-2.5 
              rounded-full 
              shadow-lg 
              border border-neutral-200/90 
              transition 
              transform 
              active:scale-95 
              cursor-pointer
            "
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-600 stroke-[2.2]" />
            <span>Search this area</span>
          </button>
        </div>
      ) : null}

      {/* Floating Listing Preview Popup Card */}
      {selectedListing && (
        <div
          className="
            absolute bottom-6 left-1/2 -translate-x-1/2 z-40 
            w-[310px] sm:w-[330px] 
            bg-white 
            rounded-3xl 
            shadow-[0_16px_40px_rgba(0,0,0,0.22)] 
            border border-neutral-200/90 
            overflow-hidden 
            animate-in fade-in zoom-in-95 duration-200
          "
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => onSelectListing(null)}
            className="
              absolute top-3 right-3 z-30 
              w-7 h-7 
              rounded-full 
              bg-white/90 hover:bg-white 
              text-neutral-700 hover:text-black 
              flex items-center justify-center 
              shadow-md 
              transition 
              cursor-pointer
            "
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Photo Carousel */}
          <div
            onClick={() => router.push(`/listings/${selectedListing.id}`)}
            className="relative aspect-[4/3] w-full bg-neutral-100 cursor-pointer group"
          >
            <Image
              fill
              loading="lazy"
              src={photos[activePhotoIdx]}
              alt={selectedListing.name}
              className="object-cover"
              sizes="330px"
              onError={(e: any) => {
                e.target.src = "/placeholder.jpg";
              }}
            />

            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="
                    absolute left-2 top-1/2 -translate-y-1/2 z-20 
                    w-7 h-7 
                    rounded-full 
                    bg-white/80 hover:bg-white 
                    text-neutral-800 
                    flex items-center justify-center 
                    shadow-sm 
                    opacity-0 group-hover:opacity-100 
                    transition 
                    cursor-pointer
                  "
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="
                    absolute right-2 top-1/2 -translate-y-1/2 z-20 
                    w-7 h-7 
                    rounded-full 
                    bg-white/80 hover:bg-white 
                    text-neutral-800 
                    flex items-center justify-center 
                    shadow-sm 
                    opacity-0 group-hover:opacity-100 
                    transition 
                    cursor-pointer
                  "
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 pointer-events-none">
                  {photos.slice(0, 5).map((_: any, idx: number) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === activePhotoIdx ? "bg-white scale-125" : "bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Card Info Details */}
          <div
            onClick={() => router.push(`/listings/${selectedListing.id}`)}
            className="p-4 cursor-pointer hover:bg-neutral-50/60 transition"
          >
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-xs font-semibold text-neutral-500 truncate">
                {selectedListing.location?.city || selectedListing.city || "Nigeria"}
              </span>
              <div className="flex items-center gap-1 shrink-0 text-xs font-bold text-neutral-900">
                <Star className="w-3.5 h-3.5 fill-black stroke-black" />
                <span>
                  {selectedListing.averageRating
                    ? Number(selectedListing.averageRating).toFixed(2)
                    : "4.85"}
                </span>
                <span className="text-neutral-400 font-normal">
                  ({selectedListing.numberOfReviews || 12})
                </span>
              </div>
            </div>

            <h4 className="font-bold text-[14px] text-neutral-900 truncate mb-1">
              {selectedListing.name}
            </h4>

            <p className="text-xs text-neutral-500 mb-2 truncate">
              {selectedListing.beds} beds • {selectedListing.baths} baths
              {selectedListing.distanceKm !== undefined && (
                <span className="ml-1 text-neutral-600 font-medium">
                  • {selectedListing.distanceKm < 1 ? "Under 1 km" : `${selectedListing.distanceKm} km`}
                </span>
              )}
            </p>

            <div className="flex items-baseline gap-1 pt-1 border-t border-neutral-100">
              <span className="font-extrabold text-[15px] text-neutral-900">
                ₦{selectedListing.annualRent?.toLocaleString()}
              </span>
              <span className="text-xs text-neutral-500 font-normal">/ year</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const InteractiveSearchMap = React.memo(
  InteractiveSearchMapComponent,
  (prev, next) => {
    return (
      prev.center?.[0] === next.center?.[0] &&
      prev.center?.[1] === next.center?.[1] &&
      prev.listings.length === next.listings.length &&
      prev.listings[0]?.id === next.listings[0]?.id &&
      prev.selectedListing?.id === next.selectedListing?.id &&
      prev.isSearchingArea === next.isSearchingArea &&
      prev.locationAnchor?.name === next.locationAnchor?.name &&
      prev.locationAnchor?.lat === next.locationAnchor?.lat &&
      prev.locationAnchor?.lng === next.locationAnchor?.lng
    );
  }
);

export default InteractiveSearchMap;
