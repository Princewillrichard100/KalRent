import * as z from "zod";
import { CampusZoneEnum, PropertyTypeEnum } from "@/lib/constants";

export const propertySchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    annualRent: z.coerce.number().positive("Annual rent must be greater than 0"),
    agentFee: z.coerce.number().nonnegative("Agent fee must be non-negative"),
    cautionDeposit: z.coerce.number().nonnegative("Caution deposit must be non-negative"),
    platformFee: z.coerce.number().nonnegative("Platform fee must be non-negative"),
    campusZone: z.nativeEnum(CampusZoneEnum),
    landmark: z.string().min(1, "Landmark is required"),
    isParkingIncluded: z.boolean(),
    photoUrls: z
      .array(z.instanceof(File))
      .min(1, "At least one photo is required"),
    amenities: z.array(z.string()).min(1, "Select at least one amenity"),
    highlights: z.array(z.string()).min(1, "Select at least one highlight"),
    beds: z.coerce.number().positive().min(0).max(10).int(),
    baths: z.coerce.number().positive().min(0).max(10).int(),
    propertyType: z.nativeEnum(PropertyTypeEnum),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().min(1, "Postal code is required"),
  })
  .refine((data) => data.agentFee <= data.annualRent * 0.1, {
    message: "Agent fee cannot exceed 10% of annual rent",
    path: ["agentFee"],
  });

export type PropertyFormData = z.infer<typeof propertySchema>;

export const applicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
  message: z.string().optional(),
});

export type ApplicationFormData = z.infer<typeof applicationSchema>;

export const settingsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 digits"),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
