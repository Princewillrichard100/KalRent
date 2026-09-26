# Bolt's Performance Journal

## 2026-09-26 - Marker Hover re-render propagation in map listing feeds
**Learning:** `ListingCard` elements attach `useMarkerHover` and receive hover state triggers (`isHovered`) or custom callbacks during map pan and interactive searches. Without `React.memo`, hovering a single listing or updating listing hover states in `ListingFeed` forces all rendered cards in the grid to re-evaluate and re-render unnecessarily.
**Action:** Always memoize cards rendered within spatial/map listing feeds where map interactions trigger frequent parent re-renders.
