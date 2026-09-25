import React from "react";
import { Property } from "@/types/prismaTypes";

interface ListingJsonLdProps {
  property: Property & {
    location?: {
      address?: string;
      city?: string;
      state?: string;
      country?: string;
      coordinates?: {
        latitude?: number;
        longitude?: number;
      };
    };
  };
  canonicalUrl: string;
}

export default function ListingJsonLd({ property, canonicalUrl }: ListingJsonLdProps) {
  const isApartment =
    property.propertyType === "Apartment" ||
    property.propertyType === "Rooms";

  const schemaType = isApartment ? "Apartment" : "SingleFamilyResidence";

  const schema = {
    "@context": "https://schema.org",
    "@type": schemaType,
    "@id": canonicalUrl,
    name: property.name,
    description: property.description,
    url: canonicalUrl,
    image: property.photoUrls || [],
    numberOfRooms: property.beds,
    numberOfBathroomsTotal: property.baths,
    numberOfBedrooms: property.beds,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.location?.address || property.landmark || "Nigeria",
      addressLocality: property.location?.city || "Nigeria",
      addressRegion: property.location?.state || "Nigeria",
      addressCountry: "NG",
    },
    ...(property.location?.coordinates?.latitude && property.location?.coordinates?.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: property.location.coordinates.latitude,
            longitude: property.location.coordinates.longitude,
          },
        }
      : {}),
    offers: {
      "@type": "Offer",
      price: property.annualRent,
      priceCurrency: "NGN",
      availability: "https://schema.org/InStock",
      validFrom: new Date(property.postedDate).toISOString().split("T")[0],
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: property.annualRent,
        priceCurrency: "NGN",
        unitCode: "ANN",
      },
    },
    amenityFeature: (property.amenities || []).map((amenity: any) => ({
      "@type": "LocationFeatureSpecification",
      name: String(amenity),
      value: true,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
