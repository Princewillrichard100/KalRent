import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  NEIGHBORHOODS,
  NIGERIAN_STATES,
  PROPERTY_TYPES,
} from "@/lib/seo/constants";
import {
  getMarketStats,
  formatNaira,
  unslugify,
  fetchLiveProperties,
} from "@/lib/seo/data";
import BreadcrumbJsonLd from "@/components/seo/schema/BreadcrumbJsonLd";
import FaqJsonLd from "@/components/seo/schema/FaqJsonLd";
import DirectoryJsonLd from "@/components/seo/schema/DirectoryJsonLd";
import GeoDirectAnswer from "@/components/seo/GeoDirectAnswer";
import NeighborhoodVibeBlock from "@/components/seo/NeighborhoodVibeBlock";
import MoveInBudgetCalculator from "@/components/seo/MoveInBudgetCalculator";
import ProgrammaticListingFeed from "@/components/seo/ProgrammaticListingFeed";
import Container from "@/components/Container";
import { ShieldCheck, ArrowRight, Home } from "lucide-react";

export const revalidate = 3600;

export async function generateStaticParams() {
  const paramsList: Array<{ state: string; city: string; propertyType: string }> = [];
  const topPropertyTypes = ["apartment", "1-bedroom-flat", "2-bedroom-flat", "self-contain"];

  for (const key of Object.keys(NEIGHBORHOODS)) {
    const [state, city] = key.split("/");
    for (const propertyType of topPropertyTypes) {
      paramsList.push({ state, city, propertyType });
    }
  }

  return paramsList;
}

interface PropertyTypePageProps {
  params: Promise<{ state: string; city: string; propertyType: string }>;
}

export async function generateMetadata({ params }: PropertyTypePageProps): Promise<Metadata> {
  const { state: stateSlug, city: citySlug, propertyType: typeSlug } = await params;
  const neighborhood = NEIGHBORHOODS[`${stateSlug.toLowerCase()}/${citySlug.toLowerCase()}`];
  const stateData = NIGERIAN_STATES[stateSlug.toLowerCase()];
  const propertyType = PROPERTY_TYPES[typeSlug.toLowerCase()];

  const cityName = neighborhood ? neighborhood.city : unslugify(citySlug);
  const stateName = stateData ? stateData.name : unslugify(stateSlug);
  const typeName = propertyType ? propertyType.name : unslugify(typeSlug);

  const stats = await getMarketStats(stateSlug, citySlug, typeSlug);

  // Exact requested title formula:
  // [Property Type] for Rent in [City], [State] | KalRent (No Ghost Listings)
  const title = `${typeName} for Rent in ${cityName}, ${stateName} | KalRent (No Ghost Listings)`;
  const description = `Find ${stats.listingCount}+ verified ${typeName.toLowerCase()} listings for rent in ${cityName}, ${stateName}. Average rent: ${formatNaira(stats.avgAnnualRent)}. Estimated move-in budget: ${formatNaira(stats.estimatedMoveInCost)}. Zero ghost listings.`;
  const canonical = `https://kalrent.com.ng/rent/${stateSlug}/${citySlug}/${typeSlug}`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "KalRent",
      images: [
        {
          url: `https://kalrent.com.ng/api/og?title=${encodeURIComponent(
            `${typeName} in ${cityName}`
          )}&city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(
            stateName
          )}&price=${encodeURIComponent(
            formatNaira(stats.avgAnnualRent)
          )}&count=${stats.listingCount}&type=${encodeURIComponent(typeName)}`,
          width: 1200,
          height: 630,
          alt: `${typeName} for Rent in ${cityName}, ${stateName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        `https://kalrent.com.ng/api/og?title=${encodeURIComponent(
          `${typeName} in ${cityName}`
        )}&city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(
          stateName
        )}&price=${encodeURIComponent(
          formatNaira(stats.avgAnnualRent)
        )}&count=${stats.listingCount}&type=${encodeURIComponent(typeName)}`,
      ],
    },
  };
}

export default async function PropertyTypePage({ params }: PropertyTypePageProps) {
  const { state: stateSlug, city: citySlug, propertyType: typeSlug } = await params;
  const neighborhood = NEIGHBORHOODS[`${stateSlug.toLowerCase()}/${citySlug.toLowerCase()}`];
  const stateData = NIGERIAN_STATES[stateSlug.toLowerCase()];
  const propertyType = PROPERTY_TYPES[typeSlug.toLowerCase()];

  if (!neighborhood || !stateData || !propertyType) {
    notFound();
  }

  const stats = await getMarketStats(stateSlug, citySlug, typeSlug);
  const liveProperties = await fetchLiveProperties({
    locationValue: neighborhood.city,
    category: propertyType.prismaEquivalent,
  });

  const faqs = [
    {
      question: `What is the average rent for a ${propertyType.name.toLowerCase()} in ${neighborhood.city}?`,
      answer: `The average annual rent for a ${propertyType.name.toLowerCase()} in ${neighborhood.city} is currently ${formatNaira(stats.avgAnnualRent)}. Prices generally range from ${formatNaira(stats.minAnnualRent)} to ${formatNaira(stats.maxAnnualRent)} depending on finishing, generator backup, and compound security.`,
    },
    {
      question: `What are the total move-in fees for a ${propertyType.name.toLowerCase()} in ${neighborhood.city}?`,
      answer: `To secure a ${propertyType.name.toLowerCase()} in ${neighborhood.city}, budget for 1 year upfront rent (${formatNaira(stats.breakdown.rent)}), 10% caution deposit (${formatNaira(stats.breakdown.cautionDeposit)}), 10% legal tenancy agreement (${formatNaira(stats.breakdown.legalFee)}), and 10% agency commission (${formatNaira(stats.breakdown.agencyFee)}). Total upfront move-in capital required is approximately ${formatNaira(stats.estimatedMoveInCost)}.`,
    },
    {
      question: `How does KalRent ensure no fake or ghost ${propertyType.name.toLowerCase()} listings are shown?`,
      answer: `KalRent performs strict physical unit verification. Field agents cross-reference landlord title documents, confirm physical keys, and photograph the exact unit before approving it on kalrent.com.ng. Tenant funds remain protected in escrow until physical move-in.`,
    },
    {
      question: `What is the electricity and infrastructure profile of ${neighborhood.city}?`,
      answer: `${neighborhood.city} is currently classified under ${neighborhood.powerBand} with a ${neighborhood.floodRisk} rating. ${neighborhood.transitHub}.`,
    },
  ];

  return (
    <div className="py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Rent", url: "/rent" },
          { name: stateData.name, url: `/rent/${stateSlug}` },
          { name: neighborhood.city, url: `/rent/${stateSlug}/${citySlug}` },
          { name: propertyType.name, url: `/rent/${stateSlug}/${citySlug}/${typeSlug}` },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <DirectoryJsonLd
        pageTitle={`${propertyType.name} for Rent in ${neighborhood.city}, ${stateData.name}`}
        pageUrl={`/rent/${stateSlug}/${citySlug}/${typeSlug}`}
        properties={liveProperties}
        city={neighborhood.city}
        state={stateData.name}
      />

      <Container>
        {/* Header Block */}
        <div className="max-w-4xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Anti-Scam Escrow Protection Active</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            {propertyType.name} for Rent in {neighborhood.city}, {stateData.name}
          </h1>

          {/* GEO Direct-Answer Paragraph for AI Citations */}
          <GeoDirectAnswer
            propertyTypeName={propertyType.name}
            locationName={`${neighborhood.city}, ${stateData.name}`}
            avgAnnualRent={stats.avgAnnualRent}
            totalMoveInBudget={stats.estimatedMoveInCost}
            listingCount={stats.listingCount}
            powerBand={neighborhood.powerBand}
            floodRisk={neighborhood.floodRisk}
          />

          <p className="mt-4 text-base text-neutral-600 leading-relaxed">
            Looking for a verified {propertyType.name.toLowerCase()} in {neighborhood.city}? KalRent connects prospective tenants directly with identity-verified landlords and licensed agents, eliminating ghost listings and unauthorized middlemen fees.
          </p>
        </div>

        {/* Quick Navigation / Other Property Types */}
        <div className="mb-10 flex flex-wrap gap-2">
          {Object.values(PROPERTY_TYPES).map((pt) => {
            const isActive = pt.slug === typeSlug;
            return (
              <Link
                key={pt.slug}
                href={`/rent/${stateSlug}/${citySlug}/${pt.slug}`}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-neutral-900 text-white"
                    : "bg-white border border-neutral-200 text-neutral-700 hover:border-emerald-600 hover:text-emerald-700"
                }`}
              >
                {pt.name}
              </Link>
            );
          })}
        </div>

        {/* Differentiating Value-Add 1: Move-In Budget Calculator */}
        <div className="mb-10">
          <MoveInBudgetCalculator
            initialRent={stats.avgAnnualRent}
            locationName={`${neighborhood.city}, ${stateData.name}`}
            propertyTypeName={propertyType.name}
          />
        </div>

        {/* Differentiating Value-Add 2: Neighborhood Vibe Block */}
        <div className="mb-12">
          <NeighborhoodVibeBlock neighborhood={neighborhood} />
        </div>

        {/* Listings Feed */}
        <ProgrammaticListingFeed
          properties={liveProperties}
          locationName={neighborhood.city}
          propertyTypeName={propertyType.name}
          searchUrl={`/search?location=${encodeURIComponent(neighborhood.city)}&category=${encodeURIComponent(propertyType.prismaEquivalent)}`}
        />

        {/* Dynamic FAQ Section */}
        <div className="mt-16 pt-12 border-t border-neutral-200 max-w-3xl">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Frequently Asked Questions: {propertyType.name} in {neighborhood.city}
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-neutral-200/80">
                <h3 className="font-bold text-base text-neutral-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
