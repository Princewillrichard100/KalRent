"use client";

import { useCallback } from "react";

export function useMarkerHover() {
  const highlightMarker = useCallback((listingId: number | string) => {
    // Direct DOM manipulation: 0ms latency, 0 React re-renders
    const markerEl = document.getElementById(`map-marker-${listingId}`);
    if (markerEl) {
      markerEl.classList.add("is-hovered");
      const wrapper = markerEl.closest(".airbnb-marker-wrapper") as HTMLElement | null;
      if (wrapper) {
        wrapper.style.zIndex = "999";
      }
    }
  }, []);

  const unhighlightMarker = useCallback((listingId: number | string) => {
    const markerEl = document.getElementById(`map-marker-${listingId}`);
    if (markerEl) {
      markerEl.classList.remove("is-hovered");
      const wrapper = markerEl.closest(".airbnb-marker-wrapper") as HTMLElement | null;
      if (wrapper) {
        wrapper.style.zIndex = "";
      }
    }
  }, []);

  return { highlightMarker, unhighlightMarker };
}

export default useMarkerHover;
