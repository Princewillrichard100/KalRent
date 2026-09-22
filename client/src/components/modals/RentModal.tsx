"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRentModal } from "@/hooks/useRentModal";
import { useLoginModal } from "@/hooks/useLoginModal";
import Modal from "./Modal";
import CategoryInput from "@/components/inputs/CategoryInput";
import Counter from "@/components/inputs/Counter";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";
import { toast } from "sonner";
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
    <div className="flex flex-col gap-5">
      <div>
        <h3 className="text-lg font-bold text-slate-900">Which best describes your place?</h3>
        <p className="text-xs text-slate-500 mt-1">
          Pick a category to help students find suitable accommodation.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto">
        {CATEGORIES.map((item) => (
          <CategoryInput
            key={item.label}
            onClick={(cat) => setCategory(cat)}
            selected={category === item.label}
            label={item.label}
            icon={item.icon}
          />
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Where is your property located?</h3>
          <p className="text-xs text-slate-500 mt-1">
            Specify the campus zone and exact street landmark in Ilorin.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-2">Campus Zone</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CAMPUS_ZONES.map((zone) => (
              <button
                key={zone}
                type="button"
                onClick={() => setCampusZone(zone)}
                className={`p-2.5 rounded-xl border text-xs font-medium text-center transition cursor-pointer ${
                  campusZone === zone
                    ? "border-rose-500 bg-rose-50/80 text-rose-700 font-bold"
                    : "border-slate-200 hover:border-slate-400 text-slate-700"
                }`}
              >
                {zone}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Street Address</label>
          <input
            type="text"
            placeholder="e.g. 15 University Road, Tanke"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1.5">Notable Landmark</label>
          <input
            type="text"
            placeholder="e.g. Opposite Sanrab Filling Station"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Share some basics about your hostel</h3>
          <p className="text-xs text-slate-500 mt-1">
            Specify room count and essential student amenities.
          </p>
        </div>
        <div className="divide-y divide-slate-100">
          <Counter
            title="Bedrooms"
            subtitle="How many bedrooms or bed spaces?"
            value={bedCount}
            onChange={(val) => setBedCount(val)}
          />
          <Counter
            title="Bathrooms"
            subtitle="How many bathrooms in this unit?"
            value={bathCount}
            onChange={(val) => setBathCount(val)}
          />
        </div>
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Add photos of your hostel</h3>
          <p className="text-xs text-slate-500 mt-1">
            Show students what the room, compound, and facilities look like.
          </p>
        </div>

        <label className="border-2 border-dashed border-slate-300 hover:border-slate-500 p-8 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition bg-slate-50/50">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-xs font-semibold text-slate-700">Click to upload photos</span>
          <span className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 10MB each</span>
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
                className="text-xs bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-medium"
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
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">How would you describe your hostel?</h3>
          <p className="text-xs text-slate-500 mt-1">Short and catchy titles work best.</p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Listing Title</label>
          <input
            type="text"
            placeholder="e.g. Serene Self-Con with Constant Power, Tanke"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
          <textarea
            rows={4}
            placeholder="Describe the atmosphere, security, water supply, and proximity to campus shuttle park."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
          />
        </div>
      </div>
    );
  }

  if (step === STEPS.PRICE) {
    const isFeeOverCeiling = agentFee > annualRent * 0.1;
    const totalUpfront = annualRent + agentFee + cautionDeposit + Math.round(annualRent * 0.05);

    bodyContent = (
      <div className="flex flex-col gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Set your pricing & statutory fees</h3>
          <p className="text-xs text-slate-500 mt-1">
            Agent fee is capped at 10% max by statutory Kwara tenancy guidelines.
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-700 block mb-1">Annual Rent (₦)</label>
          <input
            type="number"
            value={annualRent}
            onChange={(e) => {
              const val = Number(e.target.value);
              setAnnualRent(val);
              setAgentFee(Math.round(val * 0.1));
            }}
            className="w-full px-4 py-2.5 text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Agent Fee (Max 10%)
            </label>
            <input
              type="number"
              value={agentFee}
              onChange={(e) => setAgentFee(Number(e.target.value))}
              className={`w-full px-3 py-2 text-xs rounded-xl border ${
                isFeeOverCeiling ? "border-rose-500 bg-rose-50" : "border-slate-200"
              }`}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Caution Deposit (Escrow)
            </label>
            <input
              type="number"
              value={cautionDeposit}
              onChange={(e) => setCautionDeposit(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl text-xs space-y-1.5">
          <div className="flex justify-between font-bold text-slate-900">
            <span>Total Tenant Upfront:</span>
            <span>₦{totalUpfront.toLocaleString()}</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Includes 5% platform fee (₦{(Math.round(annualRent * 0.05)).toLocaleString()}) & BaaS Escrow Guarantee.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Modal
      isOpen={rentModal.isOpen}
      onClose={rentModal.onClose}
      onSubmit={onSubmit}
      actionLabel={actionLabel}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      title="List your Hostel on KalRent"
      body={bodyContent}
    />
  );
};

export default RentModal;
