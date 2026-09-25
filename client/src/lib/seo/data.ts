import {
  NEIGHBORHOODS,
  NIGERIAN_STATES,
  PROPERTY_TYPES,
  NeighborhoodData,
  PropertyTypeMeta,
  StateData,
  STANDARD_FEE_RATES,
} from "./constants";
import { Property } from "@/types/prismaTypes";

export interface ProgrammaticMarketStats {
  locationTitle: string;
  propertyTypeTitle: string;
  state: StateData;
  neighborhood?: NeighborhoodData;
  propertyType?: PropertyTypeMeta;
  listingCount: number;
  avgAnnualRent: number;
  minAnnualRent: number;
  maxAnnualRent: number;
  estimatedMoveInCost: number;
  breakdown: {
    rent: number;
    cautionDeposit: number;
    legalFee: number;
    agencyFee: number;
    kalrentEscrowProtection: number;
    total: number;
  };
}

export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function unslugify(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function getStateData(stateSlug: string): StateData | undefined {
  return NIGERIAN_STATES[stateSlug.toLowerCase()];
}

export function getNeighborhoodData(
  stateSlug: string,
  citySlug: string
): NeighborhoodData | undefined {
  const key = `${stateSlug.toLowerCase()}/${citySlug.toLowerCase()}`;
  return NEIGHBORHOODS[key];
}

export function getPropertyTypeData(typeSlug: string): PropertyTypeMeta | undefined {
  return PROPERTY_TYPES[typeSlug.toLowerCase()];
}

export async function fetchLiveProperties(filters: {
  locationValue?: string;
  category?: string;
}): Promise<Property[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
  const params = new URLSearchParams();

  if (filters.locationValue) params.set("locationValue", filters.locationValue);
  if (filters.category) params.set("category", filters.category);

  try {
    const res = await fetch(`${baseUrl}/properties?${params.toString()}`, {
      next: { revalidate: 3600 },
      signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(1500) : undefined,
    }).catch(() => null);
    if (!res || !res.ok) return [];
    const data = await res.json().catch(() => []);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function fetchSingleProperty(id: number): Promise<Property | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3002";
  try {
    const res = await fetch(`${baseUrl}/properties/${id}`, {
      next: { revalidate: 3600 },
      signal: typeof AbortSignal !== "undefined" && "timeout" in AbortSignal ? AbortSignal.timeout(1500) : undefined,
    }).catch(() => null);
    if (!res || !res.ok) return null;
    return await res.json().catch(() => null);
  } catch {
    return null;
  }
}

export async function getMarketStats(
  stateSlug: string,
  citySlug?: string,
  typeSlug?: string
): Promise<ProgrammaticMarketStats> {
  const state = getStateData(stateSlug) || {
    name: unslugify(stateSlug),
    slug: stateSlug,
    tagline: `Verified residential properties for rent in ${unslugify(stateSlug)}`,
    description: `Browse verified houses, apartments, and flats for rent in ${unslugify(stateSlug)}, Nigeria.`,
    popularCities: [],
  };

  const neighborhood = citySlug ? getNeighborhoodData(stateSlug, citySlug) : undefined;
  const propertyType = typeSlug ? getPropertyTypeData(typeSlug) : undefined;

  // Try live database count and rents first
  const queryLocation = neighborhood ? neighborhood.city : state.name;
  const liveProperties = await fetchLiveProperties({
    locationValue: queryLocation,
    category: propertyType?.prismaEquivalent,
  });

  let medianRent = 2500000;
  if (neighborhood && propertyType) {
    const typeKey = propertyType.slug as keyof typeof neighborhood.medianRents;
    medianRent = neighborhood.medianRents[typeKey] || neighborhood.medianRents.apartment;
  } else if (neighborhood) {
    medianRent = neighborhood.medianRents.apartment;
  } else {
    medianRent = 2200000;
  }

  // If live properties exist, blend real prices
  let avgPrice = medianRent;
  let minPrice = Math.round(medianRent * 0.8);
  let maxPrice = Math.round(medianRent * 1.35);

  if (liveProperties.length > 0) {
    const rents = liveProperties.map((p) => p.annualRent).filter((r) => r > 0);
    if (rents.length > 0) {
      avgPrice = Math.round(rents.reduce((a, b) => a + b, 0) / rents.length);
      minPrice = Math.min(...rents);
      maxPrice = Math.max(...rents);
    }
  }

  const listingCount = Math.max(liveProperties.length, 12);

  // Compute standard Nigerian move-in breakdown:
  const cautionDeposit = Math.round(avgPrice * STANDARD_FEE_RATES.cautionPercent);
  const legalFee = Math.round(avgPrice * STANDARD_FEE_RATES.legalPercent);
  const agencyFee = Math.round(avgPrice * STANDARD_FEE_RATES.agencyPercent);
  const totalMoveIn = avgPrice + cautionDeposit + legalFee + agencyFee;

  const locationTitle = neighborhood
    ? `${neighborhood.city}, ${state.name}`
    : state.name;
  const propertyTypeTitle = propertyType
    ? propertyType.name
    : "Residential Properties";

  return {
    locationTitle,
    propertyTypeTitle,
    state,
    neighborhood,
    propertyType,
    listingCount,
    avgAnnualRent: avgPrice,
    minAnnualRent: minPrice,
    maxAnnualRent: maxPrice,
    estimatedMoveInCost: totalMoveIn,
    breakdown: {
      rent: avgPrice,
      cautionDeposit,
      legalFee,
      agencyFee,
      kalrentEscrowProtection: 0,
      total: totalMoveIn,
    },
  };
}

export function getAllProgrammaticPaths(): Array<{
  state: string;
  city?: string;
  propertyType?: string;
}> {
  const paths: Array<{
    state: string;
    city?: string;
    propertyType?: string;
  }> = [];

  const types = Object.keys(PROPERTY_TYPES);

  // 1. All states
  for (const stateSlug of Object.keys(NIGERIAN_STATES)) {
    paths.push({ state: stateSlug });
  }

  // 2. All neighborhoods + property type combinations
  for (const [key, data] of Object.entries(NEIGHBORHOODS)) {
    const [stateSlug, citySlug] = key.split("/");
    paths.push({ state: stateSlug, city: citySlug });

    // Popular types per neighborhood for static pre-rendering
    for (const typeSlug of types.slice(0, 4)) {
      paths.push({ state: stateSlug, city: citySlug, propertyType: typeSlug });
    }
  }

  return paths;
}
