import React from "react";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchSingleProperty, formatNaira, slugify } from "@/lib/seo/data";
import ListingJsonLd from "@/components/seo/schema/ListingJsonLd";
import BreadcrumbJsonLd from "@/components/seo/schema/BreadcrumbJsonLd";
import Container from "@/components/Container";
import {
  ShieldCheck,
  MapPin,
  Bed,
  Bath,
  CheckCircle2,
  Calendar,
  Lock,
  ArrowLeft,
  Share2,
} from "lucide-react";
import MoveInBudgetCalculator from "@/components/seo/MoveInBudgetCalculator";

export const revalidate = 3600;

interface PropertyPageProps {
  params: Promise<{ slugId: string }>;
}

function parseIdFromSlugId(slugId: string): number | null {
  const parts = slugId.split("-");
  const rawId = parts[parts.length - 1];
  const parsed = Number(rawId);
  return isNaN(parsed) ? null : parsed;
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slugId } = await params;
  const id = parseIdFromSlugId(slugId);
  if (!id) return {};

  const property = await fetchSingleProperty(id);
  if (!property) return {};

  const city = (property as any).location?.city || "Nigeria";
  const state = (property as any).location?.state || "Nigeria";
  const canonicalSlug = `${slugify(property.name)}-${property.id}`;
  const canonical = `https://kalrent.com.ng/property/${canonicalSlug}`;

  const title = `${property.name} for Rent in ${city}, ${state} | KalRent`;
  const description = `Verified ${property.beds} bedroom ${property.propertyType.toLowerCase()} for rent in ${city}, ${state}. Annual rent: ${formatNaira(
    property.annualRent
  )}. Verified landlord, zero ghost listings, 100% escrow protection.`;

  const ogImage = property.photoUrls?.[0] || `https://kalrent.com.ng/api/og?title=${encodeURIComponent(property.name)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}&price=${encodeURIComponent(formatNaira(property.annualRent))}`;

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
          url: ogImage,
          width: 1200,
          height: 630,
          alt: property.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PropertyDetailPage({ params }: PropertyPageProps) {
  const { slugId } = await params;
  const id = parseIdFromSlugId(slugId);

  if (!id) {
    notFound();
  }

  const property = await fetchSingleProperty(id);
  if (!property) {
    notFound();
  }

  const location = (property as any).location || {};
  const city = location.city || "Nigeria";
  const state = location.state || "Nigeria";
  const canonicalSlug = `${slugify(property.name)}-${property.id}`;
  const canonicalUrl = `https://kalrent.com.ng/property/${canonicalSlug}`;

  // Redirect if URL slug is outdated or mismatched to preserve strict canonicalization
  if (slugId !== canonicalSlug) {
    redirect(`/property/${canonicalSlug}`);
  }

  const photos: string[] =
    property.photoUrls && property.photoUrls.length > 0
      ? (property.photoUrls as string[])
      : ["/placeholder.jpg"];

  return (
    <div className="py-8 bg-background min-h-screen text-foreground">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Rent", url: "/rent" },
          { name: state, url: `/rent/${slugify(state)}` },
          { name: city, url: `/rent/${slugify(state)}/${slugify(city)}` },
          { name: property.name, url: `/property/${canonicalSlug}` },
        ]}
      />
      <ListingJsonLd property={property} canonicalUrl={canonicalUrl} />

      <Container>
        {/* Navigation Breadcrumb Bar */}
        <div className="flex items-center justify-between pb-6">
          <Link
            href={`/rent/${slugify(state)}/${slugify(city)}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to {city} Rentals</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Identity Verified Landlord • ID: #{property.id}</span>
          </div>
        </div>

        {/* Title & Location Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground tracking-tight">
            {property.name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-primary" />
              <span>{location.address || property.landmark || city}, {city}, {state}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-muted-foreground" />
              <span>{property.beds} Bedrooms</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-muted-foreground" />
              <span>{property.baths} Bathrooms</span>
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-10 rounded-2xl overflow-hidden max-h-[500px]">
          <div className="md:col-span-2 relative h-[320px] md:h-[500px] bg-muted">
            <Image
              src={photos[0]}
              alt={`${property.name} main view`}
              fill
              priority
              className="object-cover hover:scale-102 transition duration-300"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="hidden md:grid md:col-span-2 grid-cols-2 gap-3 h-[500px]">
            {photos.slice(1, 5).map((photo: string, idx: number) => (
              <div key={idx} className="relative h-[244px] bg-muted">
                <Image
                  src={photo}
                  alt={`${property.name} view ${idx + 2}`}
                  fill
                  className="object-cover hover:scale-102 transition duration-300"
                  sizes="25vw"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Main Details & Booking Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Overview, Amenities & Description */}
          <div className="lg:col-span-7 space-y-8">
            {/* Description */}
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-2xs">
              <h2 className="text-xl font-bold text-foreground mb-3">
                About this Property
              </h2>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>

            {/* Amenities Checklist */}
            <div className="bg-card p-6 md:p-8 rounded-2xl border border-border shadow-2xs">
              <h2 className="text-xl font-bold text-foreground mb-4">
                What this place offers
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(property.amenities || []).map((amenity: string, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-foreground bg-muted/40 p-3 rounded-xl border border-border">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    <span className="truncate">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Move-in Budget Calculator for this Property */}
            <div>
              <MoveInBudgetCalculator
                initialRent={property.annualRent}
                locationName={`${city}, ${state}`}
                propertyTypeName={property.propertyType}
              />
            </div>
          </div>

          {/* Right: Sticky Reservation Card */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-md">
              <div className="flex items-baseline justify-between pb-6 border-b border-border">
                <div>
                  <span className="text-3xl font-black text-foreground">
                    {formatNaira(property.annualRent)}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium ml-1">/year</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-primary font-semibold bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Fee Transparency Box */}
              <div className="py-5 space-y-2.5 text-xs text-muted-foreground border-b border-border">
                <div className="flex justify-between">
                  <span>Refundable Caution Deposit (10%)</span>
                  <span className="font-semibold text-foreground">
                    {formatNaira(property.annualRent * 0.1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tenancy Agreement &amp; Legal (10%)</span>
                  <span className="font-semibold text-foreground">
                    {formatNaira(property.annualRent * 0.1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Agency Commission (10%)</span>
                  <span className="font-semibold text-foreground">
                    {formatNaira(property.annualRent * 0.1)}
                  </span>
                </div>
                <div className="flex justify-between text-primary font-medium pt-1">
                  <span>KalRent Escrow Protection</span>
                  <span className="font-bold">FREE (0%)</span>
                </div>
              </div>

              <div className="py-4 flex justify-between items-baseline text-sm font-bold text-foreground">
                <span>Estimated Upfront Move-In</span>
                <span className="text-xl text-primary font-black">
                  {formatNaira(property.annualRent * 1.3)}
                </span>
              </div>

              <Link
                href={`/listings/${property.id}`}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Reserve with Escrow Protection</span>
              </Link>

              <p className="text-[11px] text-muted-foreground text-center mt-3 leading-normal">
                Funds are held in secure escrow and released to the landlord only after you inspect and accept the keys.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
