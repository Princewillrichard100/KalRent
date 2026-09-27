import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { NIGERIAN_STATES, NEIGHBORHOODS, PROPERTY_TYPES } from "@/lib/seo/constants";
import BreadcrumbJsonLd from "@/components/seo/schema/BreadcrumbJsonLd";
import Container from "@/components/Container";
import { Building2, MapPin, ShieldCheck, ArrowRight, Home, Sparkles } from "lucide-react";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Houses, Flats & Apartments for Rent in Nigeria | KalRent Directory",
  description:
    "Explore verified houses, mini-flats, and serviced apartments for rent across Lagos, Abuja, Kwara, Ibadan, and Port Harcourt. 100% scam-free, zero ghost listings.",
  alternates: {
    canonical: "https://kalrent.com.ng/rent",
  },
  openGraph: {
    title: "Houses & Apartments for Rent Across Nigeria | KalRent",
    description:
      "Find verified rental homes across Nigeria with KalRent Escrow protection. Zero ghost listings.",
    url: "https://kalrent.com.ng/rent",
    siteName: "KalRent",
    images: [
      {
        url: "https://kalrent.com.ng/api/og?title=Rental+Directory+Nigeria&subtitle=Verified+Homes+Across+Nigeria",
        width: 1200,
        height: 630,
        alt: "KalRent Nigeria Rental Directory",
      },
    ],
  },
};

export default function RentIndexPage() {
  const states = Object.values(NIGERIAN_STATES);
  const neighborhoods = Object.values(NEIGHBORHOODS);
  const propertyTypes = Object.values(PROPERTY_TYPES);

  return (
    <div className="py-10 bg-background text-foreground min-h-screen">
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Rent", url: "/rent" },
        ]}
      />

      <Container>
        {/* Hero Section */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Anti-Fraud Guarantee: Zero Ghost Listings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            Rent Verified Homes Across Nigeria
          </h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 leading-relaxed">
            Direct access to verified properties in prime Nigerian residential corridors. Every landlord is identity-checked and verified by KalRent before listing.
          </p>
        </div>

        {/* States Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Browse by State &amp; Federal Capital
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                Explore major rental markets across Nigeria.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {states.map((state) => (
              <Link
                key={state.slug}
                href={`/rent/${state.slug}`}
                className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/80 hover:shadow-md transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 text-foreground group-hover:text-primary flex items-center justify-center transition">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition">
                        {state.name}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {state.popularCities.length} Popular Hubs
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {state.tagline}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Explore {state.name} Homes</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Neighborhoods Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Top Trending Rental Neighborhoods
              </h2>
              <p className="text-sm text-neutral-500 mt-1">
                High-demand hubs with verified electricity and security ratings.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {neighborhoods.map((n) => (
              <Link
                key={`${n.stateSlug}-${n.slug}`}
                href={`/rent/${n.stateSlug}/${n.slug}`}
                className="p-4 rounded-xl bg-card border border-border hover:border-primary transition hover:shadow-xs flex items-center justify-between group"
              >
                <div>
                  <div className="font-bold text-sm text-foreground group-hover:text-primary transition">
                    {n.city}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {n.state} • {n.powerBand.split(" ")[0]}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
              </Link>
            ))}
          </div>
        </div>

        {/* Popular Property Formats */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Browse by Property Format
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Find exactly the layout you need.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {propertyTypes.map((pt) => (
              <div
                key={pt.slug}
                className="p-5 rounded-xl bg-card border border-border flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                    <Home className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-base text-foreground mb-1">
                    {pt.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pt.descriptionTemplate}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-border flex flex-wrap gap-1.5">
                  <Link
                    href={`/rent/lagos/lekki/${pt.slug}`}
                    className="text-[11px] px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary text-foreground transition"
                  >
                    in Lekki
                  </Link>
                  <Link
                    href={`/rent/lagos/yaba/${pt.slug}`}
                    className="text-[11px] px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary text-foreground transition"
                  >
                    in Yaba
                  </Link>
                  <Link
                    href={`/rent/abuja/maitama/${pt.slug}`}
                    className="text-[11px] px-2 py-1 rounded bg-muted hover:bg-primary/10 hover:text-primary text-foreground transition"
                  >
                    in Maitama
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
