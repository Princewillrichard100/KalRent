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

const CAMPUS_ZONES = [
  "Tanke",
  "Sanrab",
  "OkeOdo",
  "Jalala",
  "MarkJunction",
  "University Road",
  "Chapel Area",
  "Tipper Garage",
];

export const SearchModal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchModal = useSearchModal();

  const [step, setStep] = useState(STEPS.LOCATION);
  const [campusZone, setCampusZone] = useState<string>("");
  const [locationQuery, setLocationQuery] = useState<string>("");
  const [bedCount, setBedCount] = useState(1);
  const [bathCount, setBathCount] = useState(1);
  const [dateRange, setDateRange] = useState<Range>({
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
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

    if (campusZone) {
      currentParams.set("campusZone", campusZone);
    } else {
      currentParams.delete("campusZone");
    }

    if (locationQuery) {
      currentParams.set("location", locationQuery);
    } else {
      currentParams.delete("location");
    }

    if (bedCount > 1) {
      currentParams.set("beds", bedCount.toString());
    } else {
      currentParams.delete("beds");
    }

    if (bathCount > 1) {
      currentParams.set("baths", bathCount.toString());
    } else {
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
    router.push(`/search?${currentParams.toString()}`);
  }, [
    step,
    searchModal,
    campusZone,
    locationQuery,
    bedCount,
    bathCount,
    dateRange,
    onNext,
    router,
    searchParams,
  ]);

  const actionLabel = useMemo(() => {
    if (step === STEPS.INFO) {
      return "Search Hostels";
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
    <div className="flex flex-col gap-8">
      <Heading
        title="Where do you want to go?"
        subtitle="Find the perfect campus hostel or location!"
      />
      <div>
        <label className="text-sm font-semibold text-neutral-700 block mb-2">
          Campus Zone
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CAMPUS_ZONES.map((zone) => {
            const isSelected = campusZone === zone;
            return (
              <button
                key={zone}
                type="button"
                onClick={() => setCampusZone(isSelected ? "" : zone)}
                className={`
                  p-3 
                  rounded-xl 
                  border-2 
                  text-xs 
                  font-semibold 
                  flex 
                  items-center 
                  gap-1.5 
                  transition 
                  cursor-pointer
                  ${
                    isSelected
                      ? "border-black bg-neutral-100"
                      : "border-neutral-200 hover:border-neutral-400"
                  }
                `}
              >
                <School className="w-3.5 h-3.5 shrink-0 text-neutral-500" />
                <span className="truncate">{zone}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-sm font-semibold text-neutral-700 block mb-1.5">
          Or Type Address / Landmark
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="e.g. Tanke Junction, Beside Mini Campus"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
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
          value={bedCount}
          onChange={(value) => setBedCount(value)}
        />
        <hr />
        <Counter
          title="Rooms"
          subtitle="How many rooms do you need?"
          value={bedCount}
          onChange={(value) => setBedCount(value)}
        />
        <hr />
        <Counter
          title="Bathrooms"
          subtitle="How many bathrooms do you need?"
          value={bathCount}
          onChange={(value) => setBathCount(value)}
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
