"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchModal } from "@/hooks/useSearchModal";
import Modal from "./Modal";
import Calendar, { Range } from "@/components/inputs/Calendar";
import Counter from "@/components/inputs/Counter";
import Heading from "@/components/Heading";
import { MapPin, School } from "lucide-react";

enum STEPS {
  LOCATION = 0,
  DATE = 1,
  INFO = 2,
}

const NIGERIAN_POPULAR_HUBS = [
  { name: "Lekki, Lagos", state: "Lagos" },
  { name: "Victoria Island", state: "Lagos" },
  { name: "Ikeja, Lagos", state: "Lagos" },
  { name: "Ikoyi, Lagos", state: "Lagos" },
  { name: "Maitama, Abuja", state: "Abuja" },
  { name: "Wuse 2, Abuja", state: "Abuja" },
  { name: "Jabi, Abuja", state: "Abuja" },
  { name: "Port Harcourt", state: "Rivers" },
  { name: "Ibadan", state: "Oyo" },
  { name: "Enugu", state: "Enugu" },
  { name: "Calabar", state: "Cross River" },
  { name: "Asaba", state: "Delta" },
  { name: "Benin City", state: "Edo" },
  { name: "Ilorin", state: "Kwara" },
];

export const SearchModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchModal = useSearchModal();

  const [step, setStep] = useState(STEPS.LOCATION);
  const [selectedHub, setSelectedHub] = useState<string>("");
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [guestCount, setGuestCount] = useState(1);
  const [roomCount, setRoomCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    key: "selection",
  });

  const onBack = useCallback(() => {
    setStep((value) => value - 1);
  }, []);

  const onNext = useCallback(() => {
    setStep((value) => value + 1);
  }, []);

  const onSubmit = useCallback(async () => {
    if (step !== STEPS.INFO) {
      return onNext();
    }

    const currentParams = new URLSearchParams(searchParams ? searchParams.toString() : "");

    const finalLocation = locationQuery.trim() || selectedHub;
    if (finalLocation) {
      currentParams.set("location", finalLocation);
      currentParams.set("locationValue", finalLocation);
    } else {
      currentParams.delete("location");
      currentParams.delete("locationValue");
      currentParams.delete("campusZone");
    }

    if (guestCount > 1) {
      currentParams.set("guestCount", guestCount.toString());
      currentParams.set("beds", guestCount.toString());
    } else {
      currentParams.delete("guestCount");
      currentParams.delete("beds");
    }

    if (roomCount > 1) {
      currentParams.set("roomCount", roomCount.toString());
    } else {
      currentParams.delete("roomCount");
    }

    if (bathroomCount > 1) {
      currentParams.set("bathroomCount", bathroomCount.toString());
      currentParams.set("baths", bathroomCount.toString());
    } else {
      currentParams.delete("bathroomCount");
      currentParams.delete("baths");
    }

    if (dateRange.startDate) {
      currentParams.set("startDate", dateRange.startDate.toISOString());
    }
    if (dateRange.endDate) {
      currentParams.set("endDate", dateRange.endDate.toISOString());
    }

    setStep(STEPS.LOCATION);
    searchModal.onClose();
    router.push(`/?${currentParams.toString()}`);
  }, [
    step,
    searchModal,
    selectedHub,
    locationQuery,
    guestCount,
    roomCount,
    bathroomCount,
    dateRange,
    onNext,
    router,
    searchParams,
  ]);

  const actionLabel = useMemo(() => {
    if (step === STEPS.INFO) {
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
        subtitle="Explore top cities, vibrant districts, and retreats nationwide."
      />

      <div>
        <label className="text-sm font-semibold text-neutral-800 block mb-2">
          Popular Destinations
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-[30vh] overflow-y-auto pr-1">
          {NIGERIAN_POPULAR_HUBS.map((hub) => {
            const isSelected = selectedHub === hub.name;
            return (
              <button
                key={hub.name}
                type="button"
                onClick={() => {
                  if (isSelected) {
                    setSelectedHub("");
                    setLocationQuery("");
                  } else {
                    setSelectedHub(hub.name);
                    setLocationQuery(hub.name);
                  }
                }}
                className={`
                  p-2.5 
                  rounded-xl 
                  border-2 
                  text-xs 
                  font-semibold 
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
                      : "border-neutral-200 hover:border-neutral-400"
                  }
                `}
              >
                <span className="truncate w-full font-bold">{hub.name}</span>
                <span className="text-[10px] text-neutral-500 font-normal">{hub.state}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-neutral-800 block mb-1.5">
          Or Type Any City, State, or Neighborhood
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="e.g. Lekki Phase 1, Maitama Abuja, Port Harcourt"
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              setSelectedHub("");
            }}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:border-black"
          />
        </div>
      </div>
    </div>
  );

  if (step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="When do you plan to go?"
          subtitle="Make sure everyone is free!"
        />
        <Calendar
          value={dateRange}
          onChange={(value) => setDateRange(value)}
        />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="More information"
          subtitle="Find your perfect place!"
        />
        <Counter
          title="Guests"
          subtitle="How many guests are coming?"
          value={guestCount}
          onChange={(value) => setGuestCount(value)}
        />
        <hr />
        <Counter
          title="Rooms"
          subtitle="How many rooms do you need?"
          value={roomCount}
          onChange={(value) => setRoomCount(value)}
        />
        <hr />
        <Counter
          title="Bathrooms"
          subtitle="How many bathrooms do you need?"
          value={bathroomCount}
          onChange={(value) => setBathroomCount(value)}
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
