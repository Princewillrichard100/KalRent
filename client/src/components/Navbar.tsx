"use client";

import Link from "next/link";
import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useGetAuthUserQuery, useGetLocationsAutocompleteQuery } from "@/state/api";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Building2,
  Search,
  Globe,
  Sparkles,
  Home as HomeIcon,
  Bell,
  MapPin,
  X,
  Loader2,
  Calendar as CalendarIcon,
  Users,
  Navigation,
  Palmtree,
  Landmark,
  GlassWater,
} from "lucide-react";
import Container from "./Container";
import SearchPill from "./navbar/SearchPill";
import UserMenu from "./navbar/UserMenu";
import { SidebarTrigger } from "./ui/sidebar";
import { useRentModal } from "@/hooks/useRentModal";
import { useLoginModal } from "@/hooks/useLoginModal";
import { useSearchModal } from "@/hooks/useSearchModal";
import Calendar, { Range } from "@/components/inputs/Calendar";
import Counter from "@/components/inputs/Counter";
import { LocationSuggestion } from "@/types/location";
import { differenceInDays, format } from "date-fns";
import { useUserLocation } from "@/hooks/useUserLocation";

const NIGERIAN_POPULAR_HUBS = [
  { name: "Near me", state: "Find what's around you", lat: null, lng: null, icon: "Navigation" },
  { name: "Lekki, Nigeria", state: "Great for summer getaways", lat: 6.4474, lng: 3.4844, icon: "Palmtree" },
  { name: "Ikeja, Nigeria", state: "Near you", lat: 6.6018, lng: 3.3515, icon: "Home" },
  { name: "Abuja, Nigeria", state: "For a trip abroad", lat: 9.0765, lng: 7.4722, icon: "Building2" },
  { name: "Ibadan, Nigeria", state: "Cultural hub", lat: 7.3775, lng: 3.9470, icon: "Landmark" },
  { name: "Victoria Island", state: "Bustling nightlife", lat: 6.4281, lng: 3.4219, icon: "GlassWater" },
  { name: "Anywhere", state: "Browse all locations", lat: null, lng: null, icon: "Globe" },
];

export const Navbar = () => {
  const router = useRouter();
  const { data: authUser } = useGetAuthUserQuery();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rentModal = useRentModal();
  const loginModal = useLoginModal();
  const searchModal = useSearchModal();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [activeDropdown, setActiveDropdown] = useState<"where" | "when" | "who" | null>(null);

  const userCoords = useUserLocation();

  // Search filter states
  const [whereInput, setWhereInput] = useState("");
  const [debouncedWhere, setDebouncedWhere] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<LocationSuggestion | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat?: number; lng?: number } | null>(null);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    key: "selection",
  });
  const [adultCount, setAdultCount] = useState(1);
  const [childrenCount, setChildrenCount] = useState(0);

  const isDashboardPage =
    pathname.includes("/managers") || pathname.includes("/tenants");

  const isSearchPage =
    pathname.startsWith("/s/") ||
    pathname.startsWith("/search") ||
    pathname.startsWith("/listings");

  const isCompactNavbar = isDashboardPage || isSearchPage || isScrolled;

  // Track scroll position for Airbnb swift ease transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
        setActiveDropdown(null); // Close dropdowns on scroll
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Debounce autocomplete input by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedWhere(whereInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [whereInput]);

  const shouldFetchAutocomplete = debouncedWhere.length >= 2;
  const {
    data: autocompleteData,
    isLoading: isAutocompleteLoading,
  } = useGetLocationsAutocompleteQuery(
    { query: debouncedWhere },
    { skip: !shouldFetchAutocomplete }
  );

  const suggestions = autocompleteData?.autocomplete_terms || [];

  // Compute search labels
  const paramLat = searchParams?.get("lat");
  const paramLng = searchParams?.get("lng");
  const paramLocation =
    searchParams?.get("location") ||
    searchParams?.get("locationValue") ||
    searchParams?.get("campusZone");
  const paramStartDate = searchParams?.get("startDate");
  const paramEndDate = searchParams?.get("endDate");
  const paramGuestCount = searchParams?.get("guestCount") || searchParams?.get("beds");

  const displayLocation = useMemo(() => {
    if (selectedLocation?.place_id === "near_me" || whereInput === "Homes near you" || whereInput === "Near me") {
      return "Homes near you";
    }
    if (selectedLocation?.place_id === "anywhere" || whereInput === "Anywhere") {
      return "Anywhere";
    }
    if (selectedLocation?.display_name) return selectedLocation.display_name;
    if (whereInput.trim()) return whereInput.trim();
    if (paramLocation && paramLocation !== "Near me" && paramLocation !== "Homes near you") return paramLocation;
    if (paramLat && paramLng && !paramLocation) return "Homes near you";
    return "Search destinations";
  }, [selectedLocation, whereInput, paramLocation, paramLat, paramLng]);

  const displayDates = useMemo(() => {
    if (dateRange.startDate && dateRange.endDate) {
      return `${format(dateRange.startDate, "MMM d")} - ${format(dateRange.endDate, "MMM d")}`;
    }
    if (paramStartDate && paramEndDate) {
      const start = new Date(paramStartDate);
      const end = new Date(paramEndDate);
      const diff = differenceInDays(end, start);
      return `${diff} ${diff === 1 ? "Night" : "Nights"}`;
    }
    return "Add dates";
  }, [dateRange, paramStartDate, paramEndDate]);

  const totalGuests = adultCount + childrenCount;
  const displayGuests = useMemo(() => {
    if (totalGuests > 1) {
      return `${totalGuests} Guests`;
    }
    if (paramGuestCount && Number(paramGuestCount) > 1) {
      return `${paramGuestCount} Guests`;
    }
    return totalGuests === 1 && (adultCount > 1 || childrenCount > 0) ? "1 Guest" : "Add guests";
  }, [totalGuests, adultCount, childrenCount, paramGuestCount]);

  const handleSelectSuggestion = useCallback(async (suggestion: LocationSuggestion) => {
    setSelectedLocation(suggestion);
    setWhereInput(suggestion.display_name);

    if (suggestion.lat !== undefined && suggestion.lng !== undefined) {
      setSelectedCoords({ lat: suggestion.lat, lng: suggestion.lng });
      setActiveDropdown("when");
      return;
    }

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
      const res = await fetch(`${baseUrl}/api/locations/details?place_id=${encodeURIComponent(suggestion.place_id)}`);
      if (res.ok) {
        const details = await res.json();
        if (details.lat && details.lng) {
          setSelectedCoords({ lat: details.lat, lng: details.lng });
        }
      }
    } catch {
      // Graceful fallback
    } finally {
      setActiveDropdown("when");
    }
  }, []);

  const handleSelectPopularHub = useCallback((hub: typeof NIGERIAN_POPULAR_HUBS[0]) => {
    if (hub.name === "Near me") {
      const applyCoords = (lat: number, lng: number) => {
        setSelectedCoords({ lat, lng });
        setSelectedLocation({
          id: "near_me",
          place_id: "near_me",
          display_name: "Homes near you",
          secondary_text: "Based on your location",
          types: ["locality"],
          terms: [{ offset: 0, value: "Near you" }],
          query: "Near you",
          lat,
          lng,
        });
        setWhereInput("Homes near you");
        setActiveDropdown("when");
      };

      if (userCoords?.lat && userCoords?.lng) {
        applyCoords(userCoords.lat, userCoords.lng);
        return;
      }

      if (typeof window !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            applyCoords(pos.coords.latitude, pos.coords.longitude);
          },
          (err) => {
            console.warn("Geolocation fallback:", err);
            applyCoords(6.5244, 3.3792);
          },
          { enableHighAccuracy: true, timeout: 6000 }
        );
      } else {
        applyCoords(6.5244, 3.3792);
      }
      return;
    }

    if (hub.name === "Anywhere") {
      setSelectedCoords(null);
      setSelectedLocation({
        id: "anywhere",
        place_id: "anywhere",
        display_name: "Anywhere",
        secondary_text: "Browse all locations",
        types: ["locality"],
        terms: [{ offset: 0, value: "Anywhere" }],
        query: "Anywhere",
      });
      setWhereInput("Anywhere");
      setActiveDropdown("when");
      return;
    }

    const suggestion: LocationSuggestion = {
      id: `hub_${hub.name}`,
      place_id: `hub_${hub.name}`,
      display_name: hub.name,
      secondary_text: `${hub.state}, Nigeria`,
      types: ["locality"],
      terms: [{ offset: 0, value: hub.name }],
      query: hub.name,
      lat: hub.lat ?? undefined,
      lng: hub.lng ?? undefined,
    };
    setSelectedLocation(suggestion);
    setWhereInput(hub.name);
    if (hub.lat && hub.lng) {
      setSelectedCoords({ lat: hub.lat, lng: hub.lng });
    } else {
      setSelectedCoords(null);
    }
    setActiveDropdown("when");
  }, [userCoords]);

  const handleExecuteSearch = useCallback(() => {
    const currentParams = new URLSearchParams(searchParams ? searchParams.toString() : "");

    const isNearMe =
      selectedLocation?.place_id === "near_me" ||
      whereInput === "Homes near you" ||
      whereInput === "Near me";

    const isAnywhere =
      selectedLocation?.place_id === "anywhere" ||
      whereInput === "Anywhere";

    if (isNearMe) {
      // Pass coordinates ONLY - DO NOT pass location text
      currentParams.delete("location");
      currentParams.delete("locationValue");
      currentParams.delete("placeId");

      const targetLat = selectedCoords?.lat ?? userCoords?.lat;
      const targetLng = selectedCoords?.lng ?? userCoords?.lng;
      if (targetLat && targetLng) {
        currentParams.set("lat", targetLat.toString());
        currentParams.set("lng", targetLng.toString());
      }
    } else if (isAnywhere) {
      currentParams.delete("location");
      currentParams.delete("locationValue");
      currentParams.delete("placeId");
      currentParams.delete("lat");
      currentParams.delete("lng");
    } else {
      const finalLocation = selectedLocation?.display_name || whereInput.trim() || paramLocation;
      if (finalLocation) {
        currentParams.set("location", finalLocation);
        currentParams.set("locationValue", finalLocation);
      } else {
        currentParams.delete("location");
        currentParams.delete("locationValue");
      }

      if (selectedCoords?.lat && selectedCoords?.lng) {
        currentParams.set("lat", selectedCoords.lat.toString());
        currentParams.set("lng", selectedCoords.lng.toString());
      }

      if (selectedLocation?.place_id) {
        currentParams.set("placeId", selectedLocation.place_id);
      }
    }

    if (dateRange.startDate) {
      currentParams.set("startDate", dateRange.startDate.toISOString());
    }
    if (dateRange.endDate) {
      currentParams.set("endDate", dateRange.endDate.toISOString());
    }

    if (totalGuests > 1) {
      currentParams.set("guestCount", totalGuests.toString());
      currentParams.set("beds", totalGuests.toString());
    } else {
      currentParams.delete("guestCount");
      currentParams.delete("beds");
    }

    let destLocation = "all";
    if (isNearMe) {
      destLocation = "near-me";
    } else if (!isAnywhere) {
      const loc = selectedLocation?.display_name || whereInput.trim() || paramLocation;
      if (loc && loc !== "Search destinations") {
        destLocation = loc.split(",")[0].trim();
      }
    }

    setActiveDropdown(null);
    router.push(`/s/${encodeURIComponent(destLocation)}/homes?${currentParams.toString()}`);
  }, [
    searchParams,
    selectedLocation,
    whereInput,
    paramLocation,
    selectedCoords,
    userCoords,
    dateRange,
    totalGuests,
    router,
  ]);

  const handleHostClick = () => {
    if (!authUser) {
      return loginModal.onOpen();
    }
    rentModal.onOpen();
  };

  return (
    <>
      {/* Background click overlay when dropdown is open */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-30 bg-black/10 transition-opacity"
          onClick={() => setActiveDropdown(null)}
        />
      )}

      <header className="fixed top-0 left-0 w-full z-40 bg-white border-b border-slate-200/80 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-2xs">
        <div
          className={`transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isCompactNavbar ? "py-3" : "py-3.5"
          }`}
        >
          <Container>
            {/* Top Row: Brand Logo | Center (Tabs vs Compact Pill) | User Actions */}
            <div className="flex flex-row items-center justify-between gap-3 md:gap-0">
              {/* Left: Brand Logo & Dashboard Trigger */}
              <div className="flex items-center gap-3 shrink-0">
                {isDashboardPage && (
                  <div className="md:hidden">
                    <SidebarTrigger />
                  </div>
                )}
                <Link href="/" className="cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 flex items-center justify-center shadow-xs">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-lg font-black tracking-tight text-slate-900 flex items-center">
                      KAL<span className="text-rose-500">RENT</span>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Center: Swift Transition between Tabs (unscrolled) & Compact Pill (scrolled) */}
              {!isDashboardPage && (
                <div className="hidden md:flex items-center justify-center relative min-w-[340px] h-12">
                  {/* 1. Category / Explore Navigation Tabs (Active at scroll = 0) */}
                  <div
                    className={`
                      flex items-center gap-6 
                      transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                      ${
                        isCompactNavbar
                          ? "opacity-0 scale-90 -translate-y-2 pointer-events-none absolute"
                          : "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                      }
                    `}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTab("all")}
                      className={`flex items-center gap-2 text-sm font-semibold transition pb-1 border-b-2 cursor-pointer ${
                        activeTab === "all"
                          ? "text-black border-black"
                          : "text-neutral-500 hover:text-neutral-800 border-transparent"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      <span>All</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("homes")}
                      className={`flex items-center gap-2 text-sm font-semibold transition pb-1 border-b-2 cursor-pointer ${
                        activeTab === "homes"
                          ? "text-black border-black"
                          : "text-neutral-500 hover:text-neutral-800 border-transparent"
                      }`}
                    >
                      <HomeIcon className="w-4 h-4" />
                      <span>Homes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("experiences")}
                      className={`flex items-center gap-2 text-sm font-semibold transition pb-1 border-b-2 cursor-pointer ${
                        activeTab === "experiences"
                          ? "text-black border-black"
                          : "text-neutral-500 hover:text-neutral-800 border-transparent"
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Experiences</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab("services")}
                      className={`flex items-center gap-2 text-sm font-semibold transition pb-1 border-b-2 cursor-pointer ${
                        activeTab === "services"
                          ? "text-black border-black"
                          : "text-neutral-500 hover:text-neutral-800 border-transparent"
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                      <span>Services</span>
                    </button>
                  </div>

                  {/* 2. Compact Search Pill (Active when scrolled or on search/dashboard) */}
                  <div
                    className={`
                      transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
                      ${
                        isCompactNavbar
                          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 scale-90 translate-y-2 pointer-events-none absolute"
                      }
                    `}
                  >
                    <SearchPill />
                  </div>
                </div>
              )}

              {/* Right: Host CTA + Globe + User Menu */}
              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleHostClick}
                  className="hidden md:block text-xs font-semibold text-neutral-800 hover:bg-neutral-100 px-3.5 py-2.5 rounded-full transition cursor-pointer"
                >
                  Become a host
                </button>

                <button
                  type="button"
                  onClick={handleHostClick}
                  className="hidden sm:flex p-2.5 rounded-full hover:bg-neutral-100 transition cursor-pointer text-neutral-700"
                  aria-label="Language & region"
                >
                  <Globe className="w-4 h-4" />
                </button>

                <UserMenu currentUser={authUser} />
              </div>
            </div>

            {/* Mobile Search Pill (Small screen only) */}
            {!isDashboardPage && (
              <div className="md:hidden mt-2.5">
                <SearchPill />
              </div>
            )}

            {/* Second Row: Large Expanded Search Bar with Distinct Inline Dropdowns */}
            {!isDashboardPage && !isSearchPage && (
              <div
                className={`
                  hidden md:block relative
                  transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] 
                  origin-top
                  ${
                    isScrolled
                      ? "max-h-0 opacity-0 -translate-y-4 scale-95 pointer-events-none pt-0 overflow-hidden"
                      : "max-h-24 opacity-100 translate-y-0 scale-100 pt-3 pb-1"
                  }
                `}
              >
                <div className="flex justify-center">
                  <div
                    className={`
                      relative flex items-center 
                      rounded-full 
                      border border-neutral-200/90 
                      transition-all duration-200
                      max-w-[880px] w-full
                      ${
                        activeDropdown
                          ? "bg-neutral-100 shadow-md"
                          : "bg-white shadow-md hover:shadow-lg divide-x divide-neutral-200/80"
                      }
                    `}
                  >
                    {/* WHERE SEGMENT */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown((prev) => (prev === "where" ? null : "where"))
                      }
                      className={`
                        flex-[1.3] text-left pl-8 pr-5 py-3.5 rounded-full transition cursor-pointer relative z-10
                        ${
                          activeDropdown === "where"
                            ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] text-neutral-900"
                            : "hover:bg-neutral-200/40 text-neutral-800"
                        }
                      `}
                    >
                      <div className="text-[13px] font-bold text-neutral-900 tracking-tight">Where</div>
                      <div className={`text-[15px] leading-5 truncate max-w-[260px] ${
                        selectedLocation || (whereInput.trim() && whereInput.trim() !== "Search destinations") || paramLocation
                          ? "text-neutral-900 font-semibold"
                          : "text-neutral-500 font-normal"
                      }`}>
                        {displayLocation}
                      </div>
                    </button>

                    {/* WHEN SEGMENT */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown((prev) => (prev === "when" ? null : "when"))
                      }
                      className={`
                        flex-1 text-left pl-7 pr-4 py-3.5 rounded-full transition cursor-pointer relative z-10
                        ${
                          activeDropdown === "when"
                            ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] text-neutral-900"
                            : "hover:bg-neutral-200/40 text-neutral-800"
                        }
                      `}
                    >
                      <div className="text-[13px] font-bold text-neutral-900 tracking-tight">When</div>
                      <div className={`text-[15px] leading-5 truncate max-w-[200px] ${
                        displayDates !== "Add dates"
                          ? "text-neutral-900 font-semibold"
                          : "text-neutral-500 font-normal"
                      }`}>
                        {displayDates}
                      </div>
                    </button>

                    {/* WHO SEGMENT */}
                    <button
                      type="button"
                      onClick={() =>
                        setActiveDropdown((prev) => (prev === "who" ? null : "who"))
                      }
                      className={`
                        flex-1 text-left pl-7 pr-4 py-3.5 rounded-full transition cursor-pointer relative z-10
                        ${
                          activeDropdown === "who"
                            ? "bg-white shadow-[0_4px_16px_rgba(0,0,0,0.12)] text-neutral-900"
                            : "hover:bg-neutral-200/40 text-neutral-800"
                        }
                      `}
                    >
                      <div className="text-[13px] font-bold text-neutral-900 tracking-tight">Who</div>
                      <div className={`text-[15px] leading-5 truncate max-w-[160px] ${
                        displayGuests !== "Add guests"
                          ? "text-neutral-900 font-semibold"
                          : "text-neutral-500 font-normal"
                      }`}>
                        {displayGuests}
                      </div>
                    </button>

                    {/* RED SEARCH ACTION BUTTON */}
                    <div className="pl-2 pr-3 py-2 shrink-0 relative z-10">
                      <button
                        type="button"
                        onClick={handleExecuteSearch}
                        className="
                          flex items-center gap-2.5 
                          bg-[#FF385C] hover:bg-[#E00B41] 
                          text-white 
                          font-semibold 
                          text-[15px] 
                          px-6 py-3.5 
                          rounded-full 
                          shadow-sm 
                          hover:shadow-md 
                          transition-all 
                          transform 
                          hover:scale-[1.02] 
                          active:scale-[0.98] 
                          cursor-pointer
                          whitespace-nowrap
                        "
                      >
                        <Search className="w-4 h-4 stroke-[2.75]" />
                        <span className="font-bold">Search</span>
                      </button>
                    </div>

                    {/* ======================================================== */}
                    {/* INLINE DROPDOWN POPUPS (Rendered directly under searchbar) */}
                    {/* ======================================================== */}

                    {/* 1. WHERE DROPDOWN POPUP */}
                    {activeDropdown === "where" && (
                      <div
                        className="
                          absolute top-full left-0 mt-3 
                          w-[440px] 
                          bg-white 
                          rounded-3xl 
                          shadow-[0_16px_36px_rgba(0,0,0,0.18)] 
                          border border-neutral-200/90 
                          p-5 
                          z-50 
                          animate-in fade-in zoom-in-95 duration-200
                        "
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="relative flex items-center mb-4">
                          <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5" />
                          <input
                            type="text"
                            autoFocus
                            placeholder="Search destinations across Nigeria"
                            value={whereInput}
                            onChange={(e) => {
                              setWhereInput(e.target.value);
                              setSelectedLocation(null);
                            }}
                            className="
                              w-full 
                              pl-10 
                              pr-9 
                              py-3 
                              text-sm 
                              font-medium 
                              rounded-xl 
                              border 
                              border-neutral-300 
                              focus:outline-none 
                              focus:border-black
                            "
                          />
                          {whereInput.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setWhereInput("");
                                setDebouncedWhere("");
                                setSelectedLocation(null);
                              }}
                              className="absolute right-3 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {shouldFetchAutocomplete ? (
                          <div className="flex flex-col max-h-[300px] overflow-y-auto divide-y divide-neutral-100">
                            {suggestions.length > 0 ? (
                              suggestions.map((suggestion) => (
                                <button
                                  key={suggestion.id || suggestion.place_id}
                                  type="button"
                                  onClick={() => handleSelectSuggestion(suggestion)}
                                  className="flex items-center gap-3 p-2.5 hover:bg-neutral-50 rounded-xl transition text-left cursor-pointer"
                                >
                                  <div className="w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-neutral-600" />
                                  </div>
                                  <div className="flex flex-col min-w-0 flex-1">
                                    <span className="font-semibold text-neutral-800 text-xs truncate">
                                      {suggestion.display_name}
                                    </span>
                                    {suggestion.secondary_text && (
                                      <span className="text-[11px] text-neutral-500 truncate">
                                        {suggestion.secondary_text}
                                      </span>
                                    )}
                                  </div>
                                </button>
                              ))
                            ) : !isAutocompleteLoading ? (
                              <div className="py-6 text-center text-xs text-neutral-500">
                                No matching destinations found.
                              </div>
                            ) : (
                              <div className="py-6 flex justify-center text-neutral-400">
                                <Loader2 className="w-5 h-5 animate-spin" />
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2.5 px-1">
                              Suggested destinations
                            </div>
                            <div className="flex flex-col max-h-[300px] overflow-y-auto">
                              {NIGERIAN_POPULAR_HUBS.map((hub) => {
                                // Create an icon map
                                const IconComponent = {
                                  Navigation,
                                  Palmtree,
                                  Home: HomeIcon,
                                  Building2,
                                  Landmark,
                                  GlassWater,
                                  Globe,
                                }[hub.icon as string] || MapPin;

                                return (
                                  <button
                                    key={hub.name}
                                    type="button"
                                    onClick={() => handleSelectPopularHub(hub)}
                                    className="flex items-center gap-4 p-2.5 hover:bg-neutral-100 rounded-xl transition text-left cursor-pointer"
                                  >
                                    <div className="w-12 h-12 rounded-xl bg-neutral-100/80 border border-neutral-200/50 flex items-center justify-center shrink-0">
                                      <IconComponent className="w-5 h-5 text-neutral-700" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-[15px] font-medium text-neutral-800">
                                        {hub.name}
                                      </span>
                                      <span className="text-[13px] text-neutral-500">
                                        {hub.state}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 2. WHEN (CALENDAR) DROPDOWN POPUP */}
                    {activeDropdown === "when" && (
                      <div
                        className="
                          absolute top-full left-1/2 -translate-x-1/2 mt-3 
                          bg-white 
                          rounded-3xl 
                          shadow-[0_16px_36px_rgba(0,0,0,0.18)] 
                          border border-neutral-200/90 
                          p-5 
                          z-50 
                          animate-in fade-in zoom-in-95 duration-200
                        "
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between mb-3 px-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Select Dates
                          </span>
                          <span className="text-xs font-semibold text-neutral-800">
                            {displayDates}
                          </span>
                        </div>

                        <div className="w-[320px] sm:w-[350px]">
                          <Calendar
                            value={dateRange}
                            onChange={(value) => setDateRange(value)}
                          />
                        </div>

                        <div className="mt-3 flex justify-between items-center pt-3 border-t border-neutral-100">
                          <button
                            type="button"
                            onClick={() =>
                              setDateRange({
                                startDate: new Date(),
                                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                                key: "selection",
                              })
                            }
                            className="text-xs font-semibold text-neutral-500 hover:underline cursor-pointer"
                          >
                            Reset dates
                          </button>
                          <button
                            type="button"
                            onClick={() => setActiveDropdown("who")}
                            className="text-xs font-bold bg-neutral-900 hover:bg-black text-white px-4 py-2 rounded-xl transition cursor-pointer"
                          >
                            Next: Guests →
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 3. WHO (GUESTS) DROPDOWN POPUP */}
                    {activeDropdown === "who" && (
                      <div
                        className="
                          absolute top-full right-0 mt-3 
                          w-84 
                          bg-white 
                          rounded-3xl 
                          shadow-[0_16px_36px_rgba(0,0,0,0.18)] 
                          border border-neutral-200/90 
                          p-6 
                          z-50 
                          animate-in fade-in zoom-in-95 duration-200
                          flex flex-col gap-5
                        "
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Counter
                          title="Adults"
                          subtitle="Ages 13 or above"
                          value={adultCount}
                          onChange={(val) => setAdultCount(Math.max(1, val))}
                        />
                        <hr className="border-neutral-100" />
                        <Counter
                          title="Children"
                          subtitle="Ages 2–12"
                          value={childrenCount}
                          onChange={(val) => setChildrenCount(Math.max(0, val))}
                        />
                        <div className="pt-2 flex justify-end">
                          <button
                            type="button"
                            onClick={handleExecuteSearch}
                            className="text-xs font-bold bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                          >
                            Apply & Search
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Container>
        </div>
      </header>
    </>
  );
};

export default Navbar;
