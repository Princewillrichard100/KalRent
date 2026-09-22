"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRentModal } from "@/hooks/useRentModal";
import { useLoginModal } from "@/hooks/useLoginModal";
import Modal from "./Modal";
import CategoryInput from "@/components/inputs/CategoryInput";
import Counter from "@/components/inputs/Counter";
import Heading from "@/components/Heading";
import Input from "@/components/inputs/Input";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";
import { toast } from "react-hot-toast";
import { CATEGORIES_LIST } from "@/components/navbar/Categories";
import {
  Upload,
  ShieldCheck,
} from "lucide-react";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

const NIGERIAN_CITIES = [
  "Lekki, Lagos",
  "Victoria Island, Lagos",
  "Ikeja, Lagos",
  "Ikoyi, Lagos",
  "Maitama, Abuja",
  "Wuse 2, Abuja",
  "Jabi, Abuja",
  "Gwarinpa, Abuja",
  "Port Harcourt, Rivers",
  "Ibadan, Oyo",
  "Enugu, Enugu",
  "Calabar, Cross River",
  "Asaba, Delta",
  "Benin City, Edo",
  "Abeokuta, Ogun",
  "Ilorin, Kwara",
];

export const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();
  const loginModal = useLoginModal();
  const { data: authUser } = useGetAuthUserQuery();
  const [createProperty, { isLoading }] = useCreatePropertyMutation();

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [category, setCategory] = useState("Apartments");
  const [selectedCity, setSelectedCity] = useState("Lekki, Lagos");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [guestCount, setGuestCount] = useState(2);
  const [roomCount, setRoomCount] = useState(1);
  const [bathCount, setBathCount] = useState(1);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rentalPrice, setRentalPrice] = useState(150000);
  const [cleaningFee, setCleaningFee] = useState(15000);
  const [securityDeposit, setSecurityDeposit] = useState(30000);

  const onBack = () => setStep((val) => val - 1);
  const onNext = () => setStep((val) => val + 1);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedPhotos((prev) => [...prev, ...filesArray]);
    }
  };

  const onSubmit = async () => {
    if (step !== STEPS.PRICE) {
      return onNext();
    }

    if (!authUser?.cognitoInfo?.userId) {
      rentModal.onClose();
      loginModal.onOpen();
      return;
    }

    try {
      const formData = new FormData();
      const cityParts = selectedCity.split(",");
      const cityName = cityParts[0]?.trim() || selectedCity;
      const stateName = cityParts[1]?.trim() || "Nigeria";

      formData.append("name", name || `${category} in ${selectedCity}`);
      formData.append(
        "description",
        description || `Beautiful and serene ${category} located in ${selectedCity}. Includes 24/7 security and essential amenities.`
      );
      formData.append("propertyType", category);
      formData.append("campusZone", selectedCity);
      formData.append("landmark", landmark || `${selectedCity}`);
      formData.append("address", address || `${selectedCity}, Nigeria`);
      formData.append("city", cityName);
      formData.append("state", stateName);
      formData.append("country", "Nigeria");
      formData.append("postalCode", "100001");
      formData.append("beds", String(roomCount));
      formData.append("baths", String(bathCount));
      formData.append("annualRent", String(rentalPrice));
      formData.append("agentFee", String(cleaningFee));
      formData.append("cautionDeposit", String(securityDeposit));
      formData.append("platformFee", String(Math.round(rentalPrice * 0.05)));
      formData.append("isParkingIncluded", "true");
      formData.append(
        "amenities",
        JSON.stringify([
          "Air Conditioning",
          "24/7 Power Supply",
          "High-Speed Wi-Fi",
          "Dedicated Security",
          "Clean Water Supply",
        ])
      );
      formData.append(
        "highlights",
        JSON.stringify(["Prime Location", "Protected Booking", "Instant Check-in"])
      );
      formData.append("managerCognitoId", authUser.cognitoInfo.userId);

      selectedPhotos.forEach((file) => {
        formData.append("photos", file);
      });

      await createProperty(formData).unwrap();
      toast.success("Listing published successfully!");
      setStep(STEPS.CATEGORY);
      rentModal.onClose();
      router.push("/properties");
    } catch (err: any) {
      toast.error(err.message || "Failed to publish listing.");
    }
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return isLoading ? "Publishing..." : "Publish Listing";
    }
    return "Next";
  }, [step, isLoading]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }
    return "Back";
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Which of these best describes your place?"
        subtitle="Pick a category"
      />
      <div
        className="
          grid 
          grid-cols-1 
          md:grid-cols-2 
          gap-3
          max-h-[50vh]
          overflow-y-auto
        "
      >
        {CATEGORIES_LIST.map((item) => (
          <div key={item.label} className="col-span-1">
            <CategoryInput
              onClick={(cat) => setCategory(cat)}
              selected={category === item.label}
              label={item.label}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where is your place located?"
          subtitle="Help guests find your property across Nigeria"
        />
        <div>
          <label className="text-sm font-semibold text-neutral-800 block mb-2">
            Select Destination / City
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[30vh] overflow-y-auto pr-1">
            {NIGERIAN_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`p-3 rounded-xl border-2 text-xs font-semibold text-center transition cursor-pointer ${
                  selectedCity === city
                    ? "border-black bg-neutral-100 font-bold shadow-sm"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <Input
          id="address"
          label="Street Address / Neighborhood"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <Input
          id="landmark"
          label="Notable Landmark or Nearest Spot"
          value={landmark}
          onChange={(e) => setLandmark(e.target.value)}
          required
        />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Share some basics about your place"
          subtitle="What amenities and capacity do you have?"
        />
        <Counter
          onChange={(value) => setGuestCount(value)}
          value={guestCount}
          title="Guests"
          subtitle="How many guests do you allow?"
        />
        <hr />
        <Counter
          onChange={(value) => setRoomCount(value)}
          value={roomCount}
          title="Rooms"
          subtitle="How many rooms / bedrooms do you have?"
        />
        <hr />
        <Counter
          onChange={(value) => setBathCount(value)}
          value={bathCount}
          title="Bathrooms"
          subtitle="How many bathrooms do you have?"
        />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add photos of your place"
          subtitle="Show guests what makes your place special!"
        />
        <label className="border-2 border-dashed border-neutral-300 hover:border-neutral-500 p-12 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition bg-neutral-50">
          <Upload className="w-10 h-10 text-neutral-400 mb-2" />
          <span className="text-sm font-semibold text-neutral-700">Click to upload photos</span>
          <span className="text-xs text-neutral-400 mt-1">PNG, JPG, WEBP up to 10MB each</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </label>

        {selectedPhotos.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedPhotos.map((file, idx) => (
              <div
                key={idx}
                className="text-xs bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-lg text-neutral-700 font-medium"
              >
                {file.name}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (step === STEPS.DESCRIPTION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="How would you describe your place?"
          subtitle="Short and sweet works best!"
        />
        <Input
          id="title"
          label="Listing Title"
          disabled={isLoading}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <hr />
        <Input
          id="description"
          label="Description"
          disabled={isLoading}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    const totalAmount = rentalPrice + cleaningFee + securityDeposit;

    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Now, set your price"
          subtitle="Set transparent pricing for your guests"
        />
        <Input
          id="price"
          label="Rate (₦)"
          formatPrice
          type="number"
          disabled={isLoading}
          value={rentalPrice}
          onChange={(e) => setRentalPrice(Number(e.target.value))}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            id="cleaningFee"
            label="Cleaning Fee (₦)"
            formatPrice
            type="number"
            disabled={isLoading}
            value={cleaningFee}
            onChange={(e) => setCleaningFee(Number(e.target.value))}
            required
          />
          <Input
            id="securityDeposit"
            label="Refundable Caution Deposit (₦)"
            formatPrice
            type="number"
            disabled={isLoading}
            value={securityDeposit}
            onChange={(e) => setSecurityDeposit(Number(e.target.value))}
            required
          />
        </div>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl text-xs space-y-2">
          <div className="flex justify-between font-bold text-neutral-900 text-sm">
            <span>Estimated Total:</span>
            <span>₦{totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-600 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Protected Booking: Includes KalRent Cover & 24/7 guest support.</span>
          </div>
          <p className="text-neutral-500 text-[11px]">
            Caution deposit is fully refundable to the guest upon checkout inspection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={rentModal.isOpen}
      title="KalRent your home"
      actionLabel={actionLabel}
      onSubmit={onSubmit}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      onClose={rentModal.onClose}
      body={bodyContent}
    />
  );
};

export default RentModal;
