import React from "react";

export default function RootJsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://kalrent.com.ng/#website",
    url: "https://kalrent.com.ng",
    name: "KalRent",
    description: "Verified Nigerian Real Estate Marketplace & Rental Housing Platform",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://kalrent.com.ng/s/{search_term_string}/homes",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://kalrent.com.ng/#organization",
    name: "KalRent Technologies Ltd",
    url: "https://kalrent.com.ng",
    logo: "https://kalrent.com.ng/logo.svg",
    sameAs: [
      "https://twitter.com/kalrentng",
      "https://www.linkedin.com/company/kalrent",
      "https://www.instagram.com/kalrentng",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+234-800-KALRENT",
      contactType: "customer service",
      areaServed: "NG",
      availableLanguage: ["English", "Yoruba", "Hausa", "Igbo"],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
