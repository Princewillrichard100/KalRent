import {
  FiltersState,
  setFilters,
  setUserLocation,
  setViewMode,
  toggleFiltersFullOpen,
} from "@/state";
import { useAppSelector } from "@/state/redux";
import { usePathname, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { debounce } from "lodash";
import { cleanParams, cn, formatPriceValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Filter,
  Grid,
  List,
  LocateFixed,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PropertyTypeIcons } from "@/lib/constants";
import { toast } from "sonner";

const FiltersBar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useAppSelector((state) => state.global.filters);
  const isFiltersFullOpen = useAppSelector(
    (state) => state.global.isFiltersFullOpen
  );
  const viewMode = useAppSelector((state) => state.global.viewMode);
  const [searchInput, setSearchInput] = useState(filters.location);

  const updateURL = debounce((newFilters: FiltersState) => {
    const cleanFilters = cleanParams(newFilters);
    const updatedSearchParams = new URLSearchParams();

    Object.entries(cleanFilters).forEach(([key, value]) => {
      updatedSearchParams.set(
        key,
        Array.isArray(value) ? value.join(",") : value.toString()
      );
    });

    router.push(`${pathname}?${updatedSearchParams.toString()}`);
  });

  const handleFilterChange = (
    key: string,
    value: any,
    isMin: boolean | null
  ) => {
    let newValue = value;

    if (key === "priceRange" || key === "squareFeet") {
      const currentArrayRange = [...filters[key]];
      if (isMin !== null) {
        const index = isMin ? 0 : 1;
        currentArrayRange[index] = value === "any" ? null : Number(value);
      }
      newValue = currentArrayRange;
    } else if (key === "coordinates") {
      newValue = value === "any" ? [0, 0] : value.map(Number);
    } else {
      newValue = value === "any" ? "any" : value;
    }

    const newFilters = { ...filters, [key]: newValue };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  const handleLocationSearch = async () => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchInput
        )}.json?access_token=${
          process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        }&fuzzyMatch=true`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        dispatch(
          setFilters({
            location: searchInput,
            coordinates: [lng, lat],
          })
        );
      }
    } catch (err) {
      console.error("Error search location:", err);
    }
  };

  const handleUseCurrentLocation = () => {
    // 1. Trigger Mapbox native GeolocateControl
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("trigger-mapbox-geolocate"));
    }

    // 2. Direct browser geolocation fallback/immediate trigger
    if ("geolocation" in navigator) {
      toast.loading("Acquiring GPS location...", { id: "geo-toast" });
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          dispatch(setUserLocation({ lat, lng }));
          updateURL({
            ...filters,
            userLat: lat,
            userLng: lng,
            coordinates: [lng, lat],
          });
          toast.success("Live GPS acquired! Proximity calculations active.", {
            id: "geo-toast",
          });
        },
        (error) => {
          console.warn("Geolocation prompt error:", error);
          toast.error("Location permission denied or unavailable.", {
            id: "geo-toast",
          });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.", {
        id: "geo-toast",
      });
    }
  };

  const handleToggleSortDistance = () => {
    const newSort = filters.sortBy === "distance" ? null : "distance";
    const newFilters = { ...filters, sortBy: newSort };
    dispatch(setFilters(newFilters));
    updateURL(newFilters);
  };

  return (
    <div className="flex flex-col w-full pt-4 pb-2">
      {/* Geolocation Quick-Action Bar */}
      <div className="flex items-center justify-between gap-3 px-2 mb-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleUseCurrentLocation}
            className={cn(
              "gap-1.5 rounded-full text-xs font-semibold px-3 py-1.5 h-auto transition-all shadow-2xs cursor-pointer",
              filters.userLat && filters.userLng
                ? "bg-emerald-50 border-emerald-500 text-emerald-800 hover:bg-emerald-100"
                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
            )}
          >
            <LocateFixed
              className={cn(
                "w-3.5 h-3.5",
                filters.userLat && filters.userLng
                  ? "text-emerald-600 animate-pulse"
                  : "text-slate-500"
              )}
            />
            <span>
              {filters.userLat && filters.userLng
                ? "Live Location Active"
                : "Use my current location"}
            </span>
          </Button>

          {filters.userLat && filters.userLng && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleToggleSortDistance}
              className={cn(
                "gap-1.5 rounded-full text-xs font-semibold px-3 py-1.5 h-auto transition-all shadow-2xs cursor-pointer",
                filters.sortBy === "distance"
                  ? "bg-slate-900 border-slate-900 text-white hover:bg-slate-800"
                  : "bg-white border-slate-300 text-slate-700 hover:bg-slate-100"
              )}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>
                {filters.sortBy === "distance"
                  ? "Sorted by Nearest (Active)"
                  : "Sort by Nearest"}
              </span>
            </Button>
          )}
        </div>

        {filters.userLat && filters.userLng && (
          <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
            <span>Calculating live proximity in km</span>
          </div>
        )}
      </div>

      {/* Campus Zone Quick-Filter Chips */}
      <div className="flex items-center gap-1.5 px-2 mb-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 font-semibold text-[11px] shrink-0 mr-1">Campus Zones:</span>
        {["All", "Tanke", "Sanrab", "OkeOdo", "Jalala", "MarkJunction"].map((zone) => {
          const isSelected = zone === "All" ? !filters.location : filters.location?.toLowerCase().includes(zone.toLowerCase());
          return (
            <button
              key={zone}
              type="button"
              onClick={() => {
                const newLoc = zone === "All" ? "" : zone;
                setSearchInput(newLoc);
                handleFilterChange("location", newLoc, null);
              }}
              className={cn(
                "px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer",
                isSelected
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              {zone === "OkeOdo" ? "Oke-Odo" : zone === "MarkJunction" ? "Mark Junction" : zone}
            </button>
          );
        })}
      </div>

      {/* Main Filters Bar */}
      <div className="flex justify-between items-center w-full flex-wrap gap-2">
        {/* Filters */}
        <div className="flex items-center gap-2 p-1 flex-wrap">
          {/* All Filters */}
          <Button
            variant="outline"
            className={cn(
              "gap-2 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold h-10 px-3.5 shadow-2xs cursor-pointer",
              isFiltersFullOpen && "bg-slate-900 text-white hover:bg-slate-800"
            )}
            onClick={() => dispatch(toggleFiltersFullOpen())}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>All Filters</span>
          </Button>

          {/* Search Location */}
          <div className="flex items-center">
            <Input
              placeholder="Search zone / street..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLocationSearch()}
              className="w-36 sm:w-44 rounded-l-xl rounded-r-none border-slate-200 border-r-0 text-xs h-10 focus-visible:ring-0 shadow-2xs"
            />
            <Button
              onClick={handleLocationSearch}
              className="rounded-r-xl rounded-l-none border border-l-0 border-slate-200 bg-white hover:bg-slate-100 text-slate-700 h-10 px-3 shadow-2xs cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Price Range */}
          <div className="flex gap-1">
            <Select
              value={filters.priceRange[0]?.toString() || "any"}
              onValueChange={(value) =>
                handleFilterChange("priceRange", value, true)
              }
            >
              <SelectTrigger className="w-24 rounded-xl border-slate-200 text-xs h-10 shadow-2xs">
                <SelectValue>
                  {formatPriceValue(filters.priceRange[0], true)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="any">Any Min</SelectItem>
                {[100000, 200000, 350000, 500000, 800000, 1200000, 2000000].map(
                  (price) => (
                    <SelectItem key={price} value={price.toString()}>
                      {price >= 1000000
                        ? `₦${price / 1000000}M+`
                        : `₦${price / 1000}k+`}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            <Select
              value={filters.priceRange[1]?.toString() || "any"}
              onValueChange={(value) =>
                handleFilterChange("priceRange", value, false)
              }
            >
              <SelectTrigger className="w-24 rounded-xl border-slate-200 text-xs h-10 shadow-2xs">
                <SelectValue>
                  {formatPriceValue(filters.priceRange[1], false)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-white rounded-xl">
                <SelectItem value="any">Any Max</SelectItem>
                {[200000, 350000, 500000, 800000, 1200000, 2000000, 4000000].map(
                  (price) => (
                    <SelectItem key={price} value={price.toString()}>
                      &lt;
                      {price >= 1000000
                        ? `₦${price / 1000000}M`
                        : `₦${price / 1000}k`}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Beds */}
          <Select
            value={filters.beds}
            onValueChange={(value) => handleFilterChange("beds", value, null)}
          >
            <SelectTrigger className="w-24 rounded-xl border-slate-200 text-xs h-10 shadow-2xs">
              <SelectValue placeholder="Beds" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl">
              <SelectItem value="any">Any Beds</SelectItem>
              <SelectItem value="1">1+ bed</SelectItem>
              <SelectItem value="2">2+ beds</SelectItem>
              <SelectItem value="3">3+ beds</SelectItem>
              <SelectItem value="4">4+ beds</SelectItem>
            </SelectContent>
          </Select>

          {/* Property Type */}
          <Select
            value={filters.propertyType || "any"}
            onValueChange={(value) =>
              handleFilterChange("propertyType", value, null)
            }
          >
            <SelectTrigger className="w-28 rounded-xl border-slate-200 text-xs h-10 shadow-2xs">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-white rounded-xl">
              <SelectItem value="any">All Types</SelectItem>
              {Object.entries(PropertyTypeIcons).map(([type, Icon]) => (
                <SelectItem key={type} value={type}>
                  <div className="flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{type}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center p-1">
          <div className="flex border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-slate-50">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2.5 py-1 rounded-none hover:bg-slate-200 h-9 transition-colors cursor-pointer",
                viewMode === "list" ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-600"
              )}
              onClick={() => dispatch(setViewMode("list"))}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "px-2.5 py-1 rounded-none hover:bg-slate-200 h-9 transition-colors cursor-pointer",
                viewMode === "grid" ? "bg-slate-900 text-white hover:bg-slate-800" : "text-slate-600"
              )}
              onClick={() => dispatch(setViewMode("grid"))}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
  </div>
  );
};

export default FiltersBar;
