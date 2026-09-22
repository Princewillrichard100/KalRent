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
import { toast } from 'react-hot-toast';
import {
  Building,
  Building2,
  Home,
  Hotel,
  ShieldCheck,
  Upload,
  Coins,
  MapPin,
  Sparkles,
} from "lucide-react";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  INFO = 2,
  IMAGES = 3,
  DESCRIPTION = 4,
  PRICE = 5,
}

export const CATEGORIES = [
  { label: "Self-Contained", icon: Home, description: "Private room with en-suite kitchen & bathroom." },
  { label: "Single Room", icon: Building, description: "Single student room with shared facilities." },
  { label: "Flat / Apartment", icon: Building2, description: "2 to 3 bedroom flats for roommates." },
  { label: "Shared Hostel", icon: Hotel, description: "Student hostel room shared with roommates." },
  { label: "Studio Apartment", icon: Sparkles, description: "Open-plan modern student living space." },
  { label: "Executive Hall", icon: Building2, description: "Premium serviced accommodation close to gate." },
];

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

export const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();
  const loginModal = useLoginModal();
  const { data: authUser } = useGetAuthUserQuery();
  const [createProperty, { isLoading }] = useCreatePropertyMutation();

  const [step, setStep] = useState(STEPS.CATEGORY);
  const [category, setCategory] = useState("Self-Contained");
  const [campusZone, setCampusZone] = useState("Tanke");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [bedCount, setBedCount] = useState(1);
  const [bathCount, setBathCount] = useState(1);
  const [selectedPhotos, setSelectedPhotos] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [annualRent, setAnnualRent] = useState(450000);
  const [agentFee, setAgentFee] = useState(45000);
  const [cautionDeposit, setCautionDeposit] = useState(50000);

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

    if (agentFee > annualRent * 0.1) {
      toast.error("Agent fee cannot exceed the statutory 10% ceiling.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name || `${category} near ${campusZone}`);
      formData.append("description", description || `Quality ${category} located in ${campusZone}, Ilorin.`);
      formData.append("propertyType", category);
      formData.append("campusZone", campusZone);
      formData.append("landmark", landmark || `${campusZone} Gate`);
      formData.append("address", address || `${campusZone}, Ilorin, Kwara State`);
      formData.append("city", "Ilorin");
      formData.append("state", "Kwara");
      formData.append("country", "Nigeria");
      formData.append("postalCode", "240001");
      formData.append("beds", String(bedCount));
      formData.append("baths", String(bathCount));
      formData.append("annualRent", String(annualRent));
      formData.append("agentFee", String(agentFee));
      formData.append("cautionDeposit", String(cautionDeposit));
      formData.append("platformFee", String(Math.round(annualRent * 0.05)));
      formData.append("isParkingIncluded", "true");
      formData.append("amenities", JSON.stringify(["Water Supply", "Security Guard", "Prepaid Meter"]));
      formData.append("highlights", JSON.stringify(["Close to Campus", "Verified Clean Water"]));
      formData.append("managerCognitoId", authUser.cognitoInfo.userId);

      selectedPhotos.forEach((file) => {
        formData.append("photos", file);
      });

      await createProperty(formData).unwrap();
      toast.success("Hostel listing created successfully!");
      setStep(STEPS.CATEGORY);
      rentModal.onClose();
      router.push("/managers/properties");
    } catch (err: any) {
      toast.error(err.message || "Failed to create property listing.");
    }
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.PRICE) {
      return isLoading ? "Publishing..." : "Publish Hostel";
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
        {CATEGORIES.map((item) => (
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
          subtitle="Help guests find you!"
        />
        <div>
          <label className="text-sm font-semibold text-neutral-700 block mb-2">Campus Zone</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CAMPUS_ZONES.map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setCampusZone(zone)}
                className={`p-3 rounded-xl border-2 text-xs font-semibold text-center transition cursor-pointer ${
                  campusZone === zone
                    ? "border-black bg-neutral-100 font-bold"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        <Input
          id="address"
          label="Street Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <Input
          id="landmark"
          label="Notable Landmark"
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
          subtitle="What amenities do you have?"
        />
        <Counter 
          onChange={(value) => setBedCount(value)}
          value={bedCount}
          title="Guests" 
          subtitle="How many guests do you allow?"
        />
        <hr />
        <Counter 
          onChange={(value) => setBedCount(value)}
          value={bedCount}
          title="Rooms" 
          subtitle="How many rooms do you have?"
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
          title="Add a photo of your place"
          subtitle="Show guests what your place looks like!"
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
          label="Title"
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
    const isFeeOverCeiling = agentFee > annualRent * 0.1;
    const totalUpfront = annualRent + agentFee + cautionDeposit + Math.round(annualRent * 0.05);

    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Now, set your price"
          subtitle="How much do you charge per year?"
        />
        <Input
          id="price"
          label="Annual Rent"
          formatPrice 
          type="number" 
          disabled={isLoading}
          value={annualRent}
          onChange={(e) => {
            const val = Number(e.target.value);
            setAnnualRent(val);
            setAgentFee(Math.round(val * 0.1));
          }}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="agentFee"
            label="Agent Fee (Max 10%)"
            formatPrice
            type="number"
            disabled={isLoading}
            value={agentFee}
            onChange={(e) => setAgentFee(Number(e.target.value))}
            required
          />
          <Input
            id="cautionDeposit"
            label="Caution Deposit (Escrow)"
            formatPrice
            type="number"
            disabled={isLoading}
            value={cautionDeposit}
            onChange={(e) => setCautionDeposit(Number(e.target.value))}
            required
          />
        </div>

        <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-xl text-xs space-y-1.5">
          <div className="flex justify-between font-bold text-neutral-900 text-sm">
            <span>Total Tenant Upfront:</span>
            <span>₦{totalUpfront.toLocaleString()}</span>
          </div>
          <p className="text-neutral-500 text-xs">
            Includes 5% platform fee (₦{(Math.round(annualRent * 0.05)).toLocaleString()}) & BaaS Escrow Guarantee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={rentModal.isOpen}
      title="Airbnb your home!"
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
