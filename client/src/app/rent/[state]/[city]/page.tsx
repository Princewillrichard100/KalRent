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
  return Object.keys(NEIGHBORHOODS).map((key) => {
    const [state, city] = key.split("/");
    return { state, city };
  });
}

interface CityPageProps {
  params: Promise<{ state: string; city: string }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const neighborhood = NEIGHBORHOODS[`${stateSlug.toLowerCase()}/${citySlug.toLowerCase()}`];
  const stateData = NIGERIAN_STATES[stateSlug.toLowerCase()];

  const cityName = neighborhood ? neighborhood.city : unslugify(citySlug);
  const stateName = stateData ? stateData.name : unslugify(stateSlug);

  const stats = await getMarketStats(stateSlug, citySlug);
  const title = `Flats & Apartments for Rent in ${cityName}, ${stateName} | KalRent (No Ghost Listings)`;
  const description = `Find ${stats.listingCount}+ verified apartments, self-contains, and flats for rent in ${cityName}, ${stateName}. Average rent: ${formatNaira(stats.avgAnnualRent)}. Move-in budget: ${formatNaira(stats.estimatedMoveInCost)}. Direct landlord verification.`;
  const canonical = `https://kalrent.com.ng/rent/${stateSlug}/${citySlug}`;

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
            `Rent in ${cityName}`
          )}&city=${encodeURIComponent(cityName)}&state=${encodeURIComponent(
            stateName
          )}&price=${encodeURIComponent(
            formatNaira(stats.avgAnnualRent)
          )}&count=${stats.listingCount}`,
          width: 1200,
          height: 630,
          alt: `Properties for Rent in ${cityName}, ${stateName}`,
        },
      ],
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { state: stateSlug, city: citySlug } = await params;
  const neighborhood = NEIGHBORHOODS[`${stateSlug.toLowerCase()}/${citySlug.toLowerCase()}`];
  const stateData = NIGERIAN_STATES[stateSlug.toLowerCase()];

  if (!neighborhood || !stateData) {
    notFound();
  }

  const stats = await getMarketStats(stateSlug, citySlug);
  const liveProperties = await fetchLiveProperties({
    locationValue: neighborhood.city,
  });

  const propertyTypes = Object.values(PROPERTY_TYPES);

  const faqs = [
    {
      question: `What is the average rent in ${neighborhood.city}, ${stateData.name}?`,
      answer: `The average annual rent for residential accommodation in ${neighborhood.city} is currently ${formatNaira(stats.avgAnnualRent)}. Typical self-contains start from ${formatNaira(neighborhood.medianRents["self-contain"])}, while 2-bedroom flats average ${formatNaira(neighborhood.medianRents["2-bedroom-flat"])}.`,
    },
    {
      question: `What are the additional move-in fees (agreement & commission) in ${neighborhood.city}?`,
      answer: `Moving into a rental home in ${neighborhood.city} typically involves a 10% refundable caution deposit (${formatNaira(stats.breakdown.cautionDeposit)}), a 10% legal tenancy agreement fee (${formatNaira(stats.breakdown.legalFee)}), and a 10% agency commission (${formatNaira(stats.breakdown.agencyFee)}). Total upfront move-in capital needed is approximately ${formatNaira(stats.estimatedMoveInCost)}.`,
    },
    {
      question: `What is the electricity situation and power availability in ${neighborhood.city}?`,
      answer: `${neighborhood.city} is rated ${neighborhood.powerBand}. ${neighborhood.powerBand.includes("Band A") ? "Residents enjoy priority feeder lines with 20+ hours of daily power, greatly reducing personal fuel expenses." : "Most modern residential estates maintain shared generator backups."}`,
    },
    {
      question: `How does KalRent protect renters from scams in ${neighborhood.city}?`,
      answer: `KalRent mandates physical site visits and title document verification for every listing in ${neighborhood.city}. Tenant funds are protected via secure escrow until the tenant inspects, approves keys, and physically takes possession.`,
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
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <DirectoryJsonLd
        pageTitle={`Flats & Apartments for Rent in ${neighborhood.city}, ${stateData.name}`}
        pageUrl={`/rent/${stateSlug}/${citySlug}`}
        properties={liveProperties}
        city={neighborhood.city}
        state={stateData.name}
      />

      <Container>
        {/* Header Block */}
        <div className="max-w-4xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Ghost Listings Guarantee • {neighborhood.city}, {stateData.name}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Apartments &amp; Flats for Rent in {neighborhood.city}, {stateData.name}
          </h1>

          {/* GEO Direct-Answer Paragraph for AI Citations */}
          <GeoDirectAnswer
            propertyTypeName="apartment"
            locationName={`${neighborhood.city}, ${stateData.name}`}
            avgAnnualRent={stats.avgAnnualRent}
            totalMoveInBudget={stats.estimatedMoveInCost}
            listingCount={stats.listingCount}
            powerBand={neighborhood.powerBand}
            floodRisk={neighborhood.floodRisk}
          />

          <p className="mt-4 text-base text-neutral-600 leading-relaxed">
            {neighborhood.description}
          </p>
        </div>

        {/* Property Type Sub-Filters */}
        <div className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-3">
            Explore by Property Type in {neighborhood.city}
          </h2>
          <div className="flex flex-wrap gap-2.5">
            {propertyTypes.map((pt) => {
              const medianPrice = neighborhood.medianRents[pt.slug as keyof typeof neighborhood.medianRents];
              return (
                <Link
                  key={pt.slug}
                  href={`/rent/${stateSlug}/${citySlug}/${pt.slug}`}
                  className="px-4 py-2.5 rounded-xl bg-white border border-neutral-200/90 hover:border-emerald-600 hover:text-emerald-700 transition flex items-center gap-2 text-xs font-semibold shadow-2xs group"
                >
                  <Home className="w-3.5 h-3.5 text-neutral-400 group-hover:text-emerald-600" />
                  <span>{pt.name}</span>
                  {medianPrice && (
                    <span className="text-[11px] font-normal text-neutral-500 group-hover:text-emerald-600">
                      (~{formatNaira(medianPrice)})
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Differentiating Value-Add 1: Neighborhood Vibe Block */}
        <div className="mb-10">
          <NeighborhoodVibeBlock neighborhood={neighborhood} />
        </div>

        {/* Differentiating Value-Add 2: Move-In Budget Calculator */}
        <div className="mb-12">
          <MoveInBudgetCalculator
            initialRent={stats.avgAnnualRent}
            locationName={`${neighborhood.city}, ${stateData.name}`}
            propertyTypeName="Apartment"
          />
        </div>

        {/* Listings Feed */}
        <ProgrammaticListingFeed
          properties={liveProperties}
          locationName={neighborhood.city}
          propertyTypeName="Apartments & Homes"
          searchUrl={`/search?location=${encodeURIComponent(neighborhood.city)}`}
        />

        {/* Dynamic FAQ Section */}
        <div className="mt-16 pt-12 border-t border-neutral-200 max-w-3xl">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Frequently Asked Questions about Renting in {neighborhood.city}
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
