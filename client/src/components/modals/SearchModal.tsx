"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearchModal } from "@/hooks/useSearchModal";
import Modal from "./Modal";
import Calendar, { Range } from "@/components/inputs/Calendar";
import Counter from "@/components/inputs/Counter";
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
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Where do you want to stay?</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select an Ilorin campus zone or landmark close to your faculty.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-2">
          Select Campus Zone
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
                  p-2.5 
                  rounded-xl 
                  border 
                  text-xs 
                  font-medium 
                  flex 
                  items-center 
                  gap-1.5 
                  transition 
                  cursor-pointer
                  ${
                    isSelected
                      ? "border-rose-500 bg-rose-50/80 text-rose-700 font-bold"
                      : "border-slate-200 hover:border-slate-400 text-slate-700"
                  }
                `}
              >
                <School className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">{zone}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-700 block mb-1.5">
          Or Type Address / Landmark
        </label>
        <div className="relative">
          <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="e.g. Tanke Junction, Beside Mini Campus"
            value={locationQuery}
            onChange={(e) => setLocationQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>
    </div>
  );

  if (step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Academic Session / Lease Period</h3>
          <p className="text-xs text-slate-500 mt-1">
            Pick your proposed move-in date and tenancy duration.
          </p>
        </div>
        <Calendar
          value={dateRange}
          onChange={(value) => setDateRange(value)}
        />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Rooms & Living Preferences</h3>
          <p className="text-xs text-slate-500 mt-1">
            Find the perfect student accommodation size for you and your roommates.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          <Counter
            title="Bedrooms"
            subtitle="How many bedrooms do you need?"
            value={bedCount}
            onChange={(value) => setBedCount(value)}
          />
          <Counter
            title="Bathrooms"
            subtitle="How many bathrooms do you require?"
            value={bathCount}
            onChange={(value) => setBathCount(value)}
          />
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={searchModal.isOpen}
      onClose={searchModal.onClose}
      onSubmit={onSubmit}
      title="Filters & Search"
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.LOCATION ? undefined : onBack}
      body={bodyContent}
    />
  );
};

export default SearchModal;
