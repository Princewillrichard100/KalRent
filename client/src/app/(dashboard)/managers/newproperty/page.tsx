"use client";

import { CustomFormField } from "@/components/FormField";
import Header from "@/components/Header";
import { Form } from "@/components/ui/form";
import { PropertyFormData, propertySchema } from "@/lib/schemas";
import { useCreatePropertyMutation, useGetAuthUserQuery } from "@/state/api";
import {
  AmenityEnum,
  CampusZoneEnum,
  HighlightEnum,
  PropertyTypeEnum,
} from "@/lib/constants";
import { formatEnumString } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Check,
  Building2,
  Coins,
  Sliders,
  Camera,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  FileCheck2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const STEPS = [
  { id: 1, name: "Basics & Location", icon: Building2 },
  { id: 2, name: "Fees & Escrow", icon: Coins },
  { id: 3, name: "Specs & Amenities", icon: Sliders },
  { id: 4, name: "Photos & Review", icon: Camera },
];

const NewProperty = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [createProperty, { isLoading: isSubmitting }] = useCreatePropertyMutation();
  const { data: authUser } = useGetAuthUserQuery();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      description: "",
      annualRent: 500000,
      agentFee: 50000,
      cautionDeposit: 50000,
      platformFee: 25000,
      campusZone: CampusZoneEnum.Tanke,
      landmark: "",
      isParkingIncluded: true,
      photoUrls: [],
      amenities: ["WiFi", "HighSpeedInternet"],
      highlights: ["RecentlyRenovated"],
      beds: 1,
      baths: 1,
      propertyType: PropertyTypeEnum.Apartment,
      address: "",
      city: "Ilorin",
      state: "Kwara",
      country: "Nigeria",
      postalCode: "240001",
    },
  });

  const watchedAnnualRent = form.watch("annualRent") || 0;
  const watchedAgentFee = form.watch("agentFee") || 0;
  const watchedCautionDeposit = form.watch("cautionDeposit") || 0;
  const selectedAmenities = form.watch("amenities") || [];
  const selectedHighlights = form.watch("highlights") || [];
  const watchedPhotos = form.watch("photoUrls") || [];

  // Auto-calculate platform fee as 5% of annual rent whenever annual rent changes
  useEffect(() => {
    const rent = Number(watchedAnnualRent) || 0;
    const autoPlatformFee = Math.round(rent * 0.05);
    form.setValue("platformFee", autoPlatformFee);
  }, [watchedAnnualRent, form]);

  const rentNum = Number(watchedAnnualRent) || 0;
  const agentFeeNum = Number(watchedAgentFee) || 0;
  const cautionNum = Number(watchedCautionDeposit) || 0;
  const platformFeeNum = Math.round(rentNum * 0.05);
  const maxAgentFee = Math.round(rentNum * 0.1);
  const isAgentFeeOverCap = agentFeeNum > maxAgentFee;
  const totalTenantCost = rentNum + agentFeeNum + cautionNum + platformFeeNum;

  const toggleAmenity = (amenity: string) => {
    const current = form.getValues("amenities") || [];
    if (current.includes(amenity)) {
      form.setValue(
        "amenities",
        current.filter((a) => a !== amenity),
        { shouldValidate: true }
      );
    } else {
      form.setValue("amenities", [...current, amenity], {
        shouldValidate: true,
      });
    }
  };

  const toggleHighlight = (highlight: string) => {
    const current = form.getValues("highlights") || [];
    if (current.includes(highlight)) {
      form.setValue(
        "highlights",
        current.filter((h) => h !== highlight),
        { shouldValidate: true }
      );
    } else {
      form.setValue("highlights", [...current, highlight], {
        shouldValidate: true,
      });
    }
  };

  const nextStep = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await form.trigger([
        "name",
        "description",
        "campusZone",
        "landmark",
        "address",
        "city",
        "state",
        "country",
        "postalCode",
      ]);
    } else if (currentStep === 2) {
      isValid = await form.trigger([
        "annualRent",
        "agentFee",
        "cautionDeposit",
        "platformFee",
      ]);
      if (isAgentFeeOverCap) {
        toast.error(`Agent fee cannot exceed 10% (₦${maxAgentFee.toLocaleString()}).`);
        return;
      }
    } else if (currentStep === 3) {
      isValid = await form.trigger([
        "beds",
        "baths",
        "propertyType",
        "isParkingIncluded",
        "amenities",
        "highlights",
      ]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fill in all required fields before proceeding.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data: PropertyFormData) => {
    if (!authUser?.cognitoInfo?.userId) {
      toast.error("Manager authentication required.");
      return;
    }

    if (data.photoUrls.length === 0) {
      toast.error("Please upload at least one property photo.");
      return;
    }

    if (data.agentFee > data.annualRent * 0.1) {
      toast.error("Agent fee exceeds the statutory 10% ceiling.");
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (key === "photoUrls") {
          const files = value as File[];
          files.forEach((file: File) => {
            formData.append("photos", file);
          });
        } else if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      });

      formData.append("managerCognitoId", authUser.cognitoInfo.userId);

      await createProperty(formData).unwrap();
      toast.success("Property listing successfully published!");
      router.push("/managers/properties");
    } catch (err: any) {
      console.error("Property creation error:", err);
      toast.error(err.message || "Failed to create property listing.");
    }
  };

  return (
    <div className="dashboard-container max-w-5xl mx-auto space-y-6">
      <Header
        title="Add New Property"
        subtitle="Publish a verified student accommodation with transparent fee breakdown"
      />

      {/* Multi-Step Wizard Navigation */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isDone = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  if (isDone) setCurrentStep(step.id);
                }}
                disabled={!isDone && !isCurrent}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                  isCurrent
                    ? "bg-emerald-50 border border-emerald-300 text-emerald-950 font-bold shadow-2xs"
                    : isDone
                    ? "bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                    : "border border-transparent text-slate-400 opacity-60 cursor-not-allowed"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isDone
                      ? "bg-emerald-600 text-white"
                      : isCurrent
                      ? "bg-emerald-200/80 text-emerald-900"
                      : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <div className="truncate">
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Step {step.id}
                  </span>
                  <span className="text-xs font-bold truncate block">{step.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* STEP 1: BASICS & LOCATION */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Basic Information &amp; Campus Location
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Define the accommodation title, description, and exact campus neighborhood in Ilorin.
                  </p>
                </div>

                <div className="space-y-4">
                  <CustomFormField
                    name="name"
                    label="Property / Hostel Name"
                    placeholder="e.g. Royal Crest Luxury Student Hall"
                  />
                  <CustomFormField
                    name="description"
                    label="Description"
                    type="textarea"
                    placeholder="Describe the property, room features, power schedule, water supply, security..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <CustomFormField
                    name="campusZone"
                    label="Campus Zone"
                    type="select"
                    options={Object.keys(CampusZoneEnum).map((zone) => ({
                      value: zone,
                      label: zone,
                    }))}
                  />
                  <CustomFormField
                    name="landmark"
                    label="Nearest Landmark"
                    placeholder="e.g. Tanke Junction, Beside UNILORIN Mini Campus"
                  />
                </div>

                <div className="space-y-4 pt-2">
                  <CustomFormField
                    name="address"
                    label="Street Address"
                    placeholder="e.g. 14 University Road, Tanke"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <CustomFormField name="city" label="City" />
                    <CustomFormField name="state" label="State" />
                    <CustomFormField name="postalCode" label="Postal Code" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: FEES & ESCROW SCHEDULE */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Financial Schedule &amp; Capped Fees (NGN ₦)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Statutory protection guarantees: agent fees capped at 10% and caution deposits held in BaaS escrow.
                  </p>
                </div>

                <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 space-y-0.5">
                    <span className="font-bold block">Statutory Compliance Mandate:</span>
                    <p>
                      In accordance with Kwara State Tenancy Laws, agent commission is capped at 10% of annual rent (₦{maxAgentFee.toLocaleString()}). Platform fee is automatically calculated at 5%.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <CustomFormField
                    name="annualRent"
                    label="Annual Rent (₦)"
                    type="number"
                    placeholder="e.g. 500000"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <CustomFormField
                        name="agentFee"
                        label={`Agent Fee (₦ - Max 10%: ₦${maxAgentFee.toLocaleString()})`}
                        type="number"
                        placeholder="e.g. 50000"
                      />
                      {isAgentFeeOverCap && (
                        <span className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Exceeds 10% statutory ceiling
                        </span>
                      )}
                    </div>

                    <CustomFormField
                      name="cautionDeposit"
                      label="Caution Deposit (₦ - Escrow Held)"
                      type="number"
                      placeholder="e.g. 50000"
                    />

                    <CustomFormField
                      name="platformFee"
                      label="Platform & Legal Verification (5% Auto)"
                      type="number"
                      disabled
                    />
                  </div>
                </div>

                {/* Total Upfront Summary Card */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                    Tenant Upfront Schedule
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block">Base Rent:</span>
                      <span className="text-sm font-bold">₦{rentNum.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Agent Fee:</span>
                      <span className="text-sm font-bold">₦{agentFeeNum.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Caution Deposit (Escrow):</span>
                      <span className="text-sm font-bold text-emerald-400">
                        ₦{cautionNum.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Platform Fee (5%):</span>
                      <span className="text-sm font-bold">₦{platformFeeNum.toLocaleString()}</span>
                    </div>
                  </div>
                  <hr className="border-slate-800" />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-semibold text-slate-300">
                      Total Upfront Payable by Student:
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₦{totalTenantCost.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SPECS & AMENITIES */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Specs &amp; Amenities
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Specify room counts, property type, and included facilities for student comfort.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <CustomFormField
                    name="propertyType"
                    label="Property Type"
                    type="select"
                    options={Object.keys(PropertyTypeEnum).map((type) => ({
                      value: type,
                      label: type,
                    }))}
                  />
                  <CustomFormField name="beds" label="Beds / Rooms" type="number" />
                  <CustomFormField name="baths" label="Bathrooms" type="number" />
                </div>

                <div className="pt-2">
                  <CustomFormField
                    name="isParkingIncluded"
                    label="Vehicle / Motorcycle Parking Available"
                    type="switch"
                  />
                </div>

                {/* Amenities Selection */}
                <div className="space-y-3 pt-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Amenities (Select all that apply)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Help students filter properties by essential campus lifestyle needs.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {Object.keys(AmenityEnum).map((amenity) => {
                      const isSelected = selectedAmenities.includes(amenity);
                      return (
                        <button
                          type="button"
                          key={amenity}
                          onClick={() => toggleAmenity(amenity)}
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs"
                              : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                          }`}
                        >
                          <span className="truncate">{formatEnumString(amenity)}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.amenities && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.amenities.message}
                    </p>
                  )}
                </div>

                {/* Highlights Selection */}
                <div className="space-y-3 pt-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Highlights &amp; Selling Points
                    </h4>
                    <p className="text-xs text-slate-500">
                      Key features that make this accommodation stand out.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {Object.keys(HighlightEnum).map((highlight) => {
                      const isSelected = selectedHighlights.includes(highlight);
                      return (
                        <button
                          type="button"
                          key={highlight}
                          onClick={() => toggleHighlight(highlight)}
                          className={`p-3 rounded-xl border text-xs font-semibold transition-all text-left flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-2xs"
                              : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                          }`}
                        >
                          <span className="truncate">{formatEnumString(highlight)}</span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {form.formState.errors.highlights && (
                    <p className="text-xs text-red-500 mt-1">
                      {form.formState.errors.highlights.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: PHOTOS & FINAL REVIEW */}
            {currentStep === 4 && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Photo Upload &amp; Review Summary
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Upload crisp property images and verify all details before publishing.
                  </p>
                </div>

                <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-4">
                  <CustomFormField
                    name="photoUrls"
                    label="Upload Property Photos (Select one or multiple)"
                    type="file"
                    accept="image/*"
                  />
                  {watchedPhotos.length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                      <Check className="w-4 h-4" />
                      <span>{watchedPhotos.length} photo(s) selected for upload</span>
                    </div>
                  )}
                </div>

                {/* Final Review Card */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-bold text-slate-900">
                      Pre-Publication Checklist
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block">Property:</span>
                        <span className="font-bold text-slate-800">{form.getValues("name") || "Untitled"}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Campus Zone & Landmark:</span>
                        <span className="font-medium text-slate-800">
                          {form.getValues("campusZone")} — {form.getValues("landmark")}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Room Specs:</span>
                        <span className="font-medium text-slate-800">
                          {form.getValues("beds")} Beds • {form.getValues("baths")} Baths • {form.getValues("propertyType")}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <span className="text-slate-400 block">Annual Base Rent:</span>
                        <span className="font-bold text-slate-900">₦{rentNum.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Caution Deposit (Escrow):</span>
                        <span className="font-bold text-emerald-700">₦{cautionNum.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Total Tenant Upfront:</span>
                        <span className="font-black text-slate-900 text-sm">₦{totalTenantCost.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Controls */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              {currentStep > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="rounded-xl border-slate-300 text-slate-700 text-xs font-semibold h-11 px-5 flex items-center gap-2 cursor-pointer hover:bg-slate-50"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </Button>
              ) : (
                <div />
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-11 px-6 flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold h-11 px-8 shadow-md flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing Property...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Publish Listing Now</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default NewProperty;
