"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchModal } from "@/hooks/useSearchModal";
import Modal from "./Modal";
import Calendar, { Range } from "@/components/inputs/Calendar";
import Heading from "@/components/Heading";
import { MapPin, X, Loader2 } from "lucide-react";
import { LocationSuggestion } from "@/types/location";
import { useGetLocationsAutocompleteQuery } from "@/state/api";

enum STEPS {
  LOCATION = 0,
  DATE = 1,
}

const NIGERIAN_POPULAR_HUBS = [
  { name: "Lekki, Lagos", state: "Lagos", lat: 6.4474, lng: 3.4844 },
  { name: "Victoria Island", state: "Lagos", lat: 6.4281, lng: 3.4219 },
  { name: "Ikeja, Lagos", state: "Lagos", lat: 6.6018, lng: 3.3515 },
  { name: "Ikoyi, Lagos", state: "Lagos", lat: 6.4549, lng: 3.4357 },
  { name: "Maitama, Abuja", state: "Abuja", lat: 9.0882, lng: 7.4934 },
  { name: "Wuse 2, Abuja", state: "Abuja", lat: 9.0765, lng: 7.4722 },
  { name: "Jabi, Abuja", state: "Abuja", lat: 9.0708, lng: 7.4278 },
  { name: "Port Harcourt", state: "Rivers", lat: 4.8156, lng: 7.0498 },
  { name: "Ibadan", state: "Oyo", lat: 7.3775, lng: 3.947 },
  { name: "Enugu", state: "Enugu", lat: 6.4584, lng: 7.5464 },
  { name: "Calabar", state: "Cross River", lat: 4.9757, lng: 8.3417 },
  { name: "Asaba", state: "Delta", lat: 6.1984, lng: 6.7329 },
  { name: "Benin City", state: "Edo", lat: 6.335, lng: 5.6037 },
  { name: "Ilorin", state: "Kwara", lat: 8.483, lng: 4.6015 },
];

export const SearchModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchModal = useSearchModal();

  const [step, setStep] = useState(STEPS.LOCATION);
  const [selectedHub, setSelectedHub] = useState<string>("");
  const [locationInput, setLocationInput] = useState<string>("");
  const [debouncedQuery, setDebouncedQuery] = useState<string>("");
  const [selectedSuggestion, setSelectedSuggestion] = useState<LocationSuggestion | null>(null);
  const [selectedCoords, setSelectedCoords] = useState<{ lat?: number; lng?: number } | null>(null);
  const [isResolvingDetails, setIsResolvingDetails] = useState(false);

  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    key: "selection",
  });

  // Debounce user keystrokes by 250ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(locationInput.trim());
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [locationInput]);

  // Query autocomplete endpoint
  const shouldFetchAutocomplete = debouncedQuery.length >= 2;
  const {
    data: autocompleteData,
    isLoading: isAutocompleteLoading,
    isFetching: isAutocompleteFetching,
  } = useGetLocationsAutocompleteQuery(
    { query: debouncedQuery },
    { skip: !shouldFetchAutocomplete }
  );

  const suggestions = autocompleteData?.autocomplete_terms || [];

  const onBack = useCallback(() => {
    setStep((value) => value - 1);
  }, []);

  const onNext = useCallback(() => {
    setStep((value) => value + 1);
  }, []);

  const handleSelectSuggestion = useCallback(async (suggestion: LocationSuggestion) => {
    setSelectedSuggestion(suggestion);
    setLocationInput(suggestion.display_name);
    setSelectedHub("");

    if (suggestion.lat !== undefined && suggestion.lng !== undefined) {
      setSelectedCoords({ lat: suggestion.lat, lng: suggestion.lng });
      setStep(STEPS.DATE);
      return;
    }

    // If coordinates missing on suggestion, resolve via details endpoint
    try {
      setIsResolvingDetails(true);
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
      const res = await fetch(`${baseUrl}/api/locations/details?place_id=${encodeURIComponent(suggestion.place_id)}`);
      if (res.ok) {
        const details = await res.json();
        if (details.lat && details.lng) {
          setSelectedCoords({ lat: details.lat, lng: details.lng });
        }
      }
    } catch {
      // Gracefully continue even if network fails
    } finally {
      setIsResolvingDetails(false);
      setStep(STEPS.DATE);
    }
  }, []);

  const handleSelectPopularHub = useCallback((hub: typeof NIGERIAN_POPULAR_HUBS[0]) => {
    setSelectedHub(hub.name);
    setLocationInput(hub.name);
    setSelectedSuggestion({
      id: `hub_${hub.name}`,
      place_id: `hub_${hub.name}`,
      display_name: hub.name,
      secondary_text: `${hub.state}, Nigeria`,
      types: ["locality"],
      terms: [{ offset: 0, value: hub.name }],
      query: hub.name,
      lat: hub.lat,
      lng: hub.lng,
    });
    setSelectedCoords({ lat: hub.lat, lng: hub.lng });
    setStep(STEPS.DATE);
  }, []);

  const handleClearInput = useCallback(() => {
    setLocationInput("");
    setDebouncedQuery("");
    setSelectedSuggestion(null);
    setSelectedCoords(null);
    setSelectedHub("");
  }, []);

  const onSubmit = useCallback(async () => {
    if (step !== STEPS.DATE) {
      return onNext();
    }

    const currentParams = new URLSearchParams(searchParams ? searchParams.toString() : "");

    const finalLocation =
      selectedSuggestion?.display_name || locationInput.trim() || selectedHub;

    const isNearMe =
      selectedSuggestion?.place_id === "near_me" ||
      locationInput === "Homes near you" ||
      locationInput === "Near me" ||
      selectedHub === "Near me";

    if (isNearMe) {
      currentParams.delete("location");
      currentParams.delete("locationValue");
      currentParams.delete("campusZone");
      currentParams.delete("placeId");
    } else if (finalLocation) {
      currentParams.set("location", finalLocation);
      currentParams.set("locationValue", finalLocation);
    } else {
      currentParams.delete("location");
      currentParams.delete("locationValue");
      currentParams.delete("campusZone");
    }

    if (selectedCoords?.lat && selectedCoords?.lng) {
      currentParams.set("lat", selectedCoords.lat.toString());
      currentParams.set("lng", selectedCoords.lng.toString());
    } else {
      currentParams.delete("lat");
      currentParams.delete("lng");
    }

    if (selectedSuggestion?.place_id) {
      currentParams.set("placeId", selectedSuggestion.place_id);
    } else {
      currentParams.delete("placeId");
    }

    if (dateRange.startDate) {
      currentParams.set("startDate", dateRange.startDate.toISOString());
    }
    if (dateRange.endDate) {
      currentParams.set("endDate", dateRange.endDate.toISOString());
    }

    let destLocation = "all";
    if (isNearMe) {
      destLocation = "near-me";
    } else if (finalLocation && finalLocation !== "Anywhere") {
      destLocation = finalLocation.split(",")[0].trim();
    }

    setStep(STEPS.LOCATION);
    searchModal.onClose();
    router.push(`/s/${encodeURIComponent(destLocation)}/homes?${currentParams.toString()}`);
  }, [
    step,
    searchModal,
    selectedSuggestion,
    locationInput,
    selectedHub,
    selectedCoords,
    dateRange,
    onNext,
    router,
    searchParams,
  ]);

  const actionLabel = useMemo(() => {
    if (step === STEPS.DATE) {
      return "Search Stays";
    }
    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.LOCATION) {
      return undefined;
    }
    return "Back";
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-6">
      <Heading
        title="Where do you want to stay in Nigeria?"
        subtitle="Search destinations, neighborhoods, and cities nationwide."
      />

      {/* Airbnb "Where" input field with clear button and loading indicator */}
      <div>
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-neutral-500 pointer-events-none">
            {isAutocompleteLoading || isAutocompleteFetching || isResolvingDetails ? (
              <Loader2 className="w-4 h-4 animate-spin text-neutral-600" />
            ) : (
              <MapPin className="w-4 h-4 text-neutral-400" />
            )}
          </div>

          <input
            type="text"
            placeholder="Search destinations across Nigeria"
            value={locationInput}
            onChange={(e) => {
              setLocationInput(e.target.value);
              setSelectedHub("");
              setSelectedSuggestion(null);
            }}
            className="
              w-full 
              pl-10 
              pr-10 
              py-3.5 
              text-sm 
              font-medium 
              rounded-2xl 
              border 
              border-neutral-300 
              focus:outline-none 
              focus:border-black 
              placeholder:text-neutral-400 
              placeholder:font-normal
              shadow-xs
            "
          />

          {locationInput.length > 0 && (
            <button
              type="button"
              onClick={handleClearInput}
              className="absolute right-3 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Live autocomplete dropdown list */}
      {shouldFetchAutocomplete ? (
        <div className="flex flex-col max-h-[42vh] overflow-y-auto rounded-2xl border border-neutral-200/80 bg-white divide-y divide-neutral-100 shadow-sm">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion) => (
              <button
                key={suggestion.id || suggestion.place_id}
                type="button"
                onClick={() => handleSelectSuggestion(suggestion)}
                className="
                  flex 
                  items-center 
                  gap-3.5 
                  px-4 
                  py-3 
                  hover:bg-neutral-50 
                  transition 
                  cursor-pointer 
                  text-left 
                  w-full
                "
              >
                {/* Left icon: circular light-gray background with MapPin */}
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-neutral-600" />
                </div>

                {/* Text container */}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-medium text-neutral-800 text-sm truncate">
                    {suggestion.display_name}
                  </span>
                  {suggestion.secondary_text && (
                    <span className="text-neutral-500 text-xs truncate">
                      {suggestion.secondary_text}
                    </span>
                  )}
                </div>
              </button>
            ))
          ) : !isAutocompleteLoading ? (
            <div className="p-6 text-center text-sm text-neutral-500">
              No matching destinations found across Nigeria.
            </div>
          ) : null}
        </div>
      ) : (
        /* Popular Destinations grid when input is empty or < 2 characters */
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-neutral-500 block mb-2.5">
            Popular Destinations
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[32vh] overflow-y-auto pr-1">
            {NIGERIAN_POPULAR_HUBS.map((hub) => {
              const isSelected = selectedHub === hub.name;
              return (
                <button
                  key={hub.name}
                  type="button"
                  onClick={() => handleSelectPopularHub(hub)}
                  className={`
                    p-3 
                    rounded-xl 
                    border 
                    text-xs 
                    font-medium 
                    flex 
                    flex-col 
                    items-start 
                    gap-0.5 
                    transition 
                    cursor-pointer
                    text-left
                    ${
                      isSelected
                        ? "border-black bg-neutral-100"
                        : "border-neutral-200 hover:border-neutral-400 bg-white hover:bg-neutral-50/50"
                    }
                  `}
                >
                  <span className="truncate w-full font-bold text-neutral-800">{hub.name}</span>
                  <span className="text-[11px] text-neutral-500">{hub.state}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <Heading
          title="When do you plan to go?"
          subtitle="Select dates for your trip."
        />
        <Calendar
          value={dateRange}
          onChange={(value) => setDateRange(value)}
        />
      </div>
    );
  }

  return (
    <Modal
      isOpen={searchModal.isOpen}
      onClose={searchModal.onClose}
      onSubmit={onSubmit}
      title="Filters"
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
      body={bodyContent}
    />
  );
};

export default SearchModal;
