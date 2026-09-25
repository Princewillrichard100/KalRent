import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  NIGERIAN_STATES,
  NEIGHBORHOODS,
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
import Container from "@/components/Container";
import ProgrammaticListingFeed from "@/components/seo/ProgrammaticListingFeed";
import { MapPin, ShieldCheck, ArrowRight, Home, Zap } from "lucide-react";

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(NIGERIAN_STATES).map((state) => ({ state }));
}

interface StatePageProps {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const stateData = NIGERIAN_STATES[stateSlug.toLowerCase()];
  if (!stateData) return {};

  const stats = await getMarketStats(stateSlug);
  const title = `Properties for Rent in ${stateData.name} | KalRent (No Ghost Listings)`;
  const description = `Browse ${stats.listingCount}+ verified apartments, flats, and houses for rent in ${stateData.name}, Nigeria. Average annual rent: ${formatNaira(stats.avgAnnualRent)}. 100% verified landlords and scam protection.`;
  const canonical = `https://kalrent.com.ng/rent/${stateSlug}`;

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
            `Rent in ${stateData.name}`
          )}&city=${encodeURIComponent(stateData.name)}&state=${encodeURIComponent(
            stateData.name
          )}&price=${encodeURIComponent(
            formatNaira(stats.avgAnnualRent)
          )}&count=${stats.listingCount}`,
          width: 1200,
          height: 630,
          alt: `Properties for Rent in ${stateData.name}`,
        },
      ],
    },
  };
}

export default async function StatePage({ params }: StatePageProps) {
  const { state: stateSlug } = await params;
  const stateData = NIGERIAN_STATES[stateSlug.toLowerCase()];

  if (!stateData) {
    notFound();
  }

  const stats = await getMarketStats(stateSlug);
  const liveProperties = await fetchLiveProperties({
    locationValue: stateData.name,
  });

  // Filter neighborhoods in this state
  const stateNeighborhoods = Object.values(NEIGHBORHOODS).filter(
    (n) => n.stateSlug.toLowerCase() === stateSlug.toLowerCase()
  );

  const faqs = [
    {
      question: `What is the average rent in ${stateData.name}?`,
      answer: `The average annual rent across residential properties in ${stateData.name} is currently estimated at ${formatNaira(stats.avgAnnualRent)} per year, ranging from ${formatNaira(stats.minAnnualRent)} for budget accommodation to ${formatNaira(stats.maxAnnualRent)} for executive residences.`,
    },
    {
      question: `What are the additional upfront move-in costs in ${stateData.name}?`,
      answer: `In ${stateData.name}, standard tenancy agreements require a 10% refundable caution deposit, 10% legal/tenancy agreement fee, and 10% agency commission on top of the annual rent, bringing total move-in budget to approximately ${formatNaira(stats.estimatedMoveInCost)}.`,
    },
    {
      question: `How does KalRent prevent rental fraud and ghost listings in ${stateData.name}?`,
      answer: `Every property on KalRent undergoes a multi-point verification check by local field agents who inspect the building, photograph the interior, and verify landlord ownership credentials before listing approval.`,
    },
  ];

  return (
    <div className="py-10">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Rent", url: "/rent" },
          { name: stateData.name, url: `/rent/${stateSlug}` },
        ]}
      />
      <FaqJsonLd faqs={faqs} />
      <DirectoryJsonLd
        pageTitle={`Properties for Rent in ${stateData.name}`}
        pageUrl={`/rent/${stateSlug}`}
        properties={liveProperties}
        state={stateData.name}
      />

      <Container>
        {/* Header Block */}
        <div className="max-w-4xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Verified Market Intelligence • {stateData.name}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Houses &amp; Apartments for Rent in {stateData.name}
          </h1>

          {/* GEO Direct-Answer Paragraph for AI Citations */}
          <GeoDirectAnswer
            propertyTypeName="residential home"
            locationName={stateData.name}
            avgAnnualRent={stats.avgAnnualRent}
            totalMoveInBudget={stats.estimatedMoveInCost}
            listingCount={stats.listingCount}
          />

          <p className="mt-4 text-base text-neutral-600 leading-relaxed">
            {stateData.description}
          </p>
        </div>

        {/* Popular Cities / Neighborhoods in this State */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Popular Rental Neighborhoods in {stateData.name}
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Select a neighborhood to explore verified local listings and power reliability.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {stateNeighborhoods.map((n) => (
              <Link
                key={n.slug}
                href={`/rent/${stateSlug}/${n.slug}`}
                className="group p-5 rounded-2xl bg-white border border-neutral-200/80 hover:border-emerald-500/80 hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-neutral-900 group-hover:text-emerald-700 transition">
                      {n.city}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                      {n.powerBand.split(" ")[0]}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                    {n.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="text-xs text-neutral-600">
                    From <span className="font-bold text-neutral-900">{formatNaira(n.medianRents["1-bedroom-flat"])}</span>/yr
                  </div>
                  <ArrowRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Listings Feed */}
        <ProgrammaticListingFeed
          properties={liveProperties}
          locationName={stateData.name}
          propertyTypeName="Properties"
          searchUrl={`/search?location=${encodeURIComponent(stateData.name)}`}
        />

        {/* FAQs Section */}
        <div className="mt-16 pt-12 border-t border-neutral-200 max-w-3xl">
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">
            Frequently Asked Questions about Renting in {stateData.name}
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
