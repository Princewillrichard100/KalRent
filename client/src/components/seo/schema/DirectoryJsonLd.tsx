import React from "react";
import { Property } from "@/types/prismaTypes";

interface DirectoryJsonLdProps {
  pageTitle: string;
  pageUrl: string;
  properties: Property[];
  city?: string;
  state?: string;
}

export default function DirectoryJsonLd({
  pageTitle,
  pageUrl,
  properties,
  city,
  state,
}: DirectoryJsonLdProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: pageTitle,
    url: pageUrl.startsWith("http") ? pageUrl : `https://kalrent.com.ng${pageUrl}`,
    numberOfItems: properties.length,
    itemListElement: properties.slice(0, 20).map((property, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "RealEstateListing",
        name: property.name,
        description: property.description,
        url: `https://kalrent.com.ng/property/${encodeURIComponent(property.name.toLowerCase().replace(/\s+/g, "-"))}-${property.id}`,
        image: property.photoUrls?.[0] || "https://kalrent.com.ng/placeholder.jpg",
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
        address: {
          "@type": "PostalAddress",
          addressLocality: city || (property as any).location?.city || "Nigeria",
          addressRegion: state || (property as any).location?.state || "Nigeria",
          addressCountry: "NG",
        },
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
