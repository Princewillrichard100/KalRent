import { MetadataRoute } from "next";
import { NIGERIAN_STATES, NEIGHBORHOODS, PROPERTY_TYPES } from "@/lib/seo/constants";
import { fetchLiveProperties, slugify } from "@/lib/seo/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://kalrent.com.ng";
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [];

  // 1. Core high-priority pages
  entries.push(
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/rent`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/landing`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    }
  );

  // 2. State directory pages
  for (const stateSlug of Object.keys(NIGERIAN_STATES)) {
    entries.push({
      url: `${baseUrl}/rent/${stateSlug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  // 3. City & Neighborhood directory pages + Property Types
  const propertyTypeSlugs = Object.keys(PROPERTY_TYPES);

  for (const [key, neighborhood] of Object.entries(NEIGHBORHOODS)) {
    const [stateSlug, citySlug] = key.split("/");

    // City hub
    entries.push({
      url: `${baseUrl}/rent/${stateSlug}/${citySlug}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    });

    // Sub-category pages (e.g. /rent/lagos/yaba/2-bedroom-flat)
    for (const typeSlug of propertyTypeSlugs) {
      entries.push({
        url: `${baseUrl}/rent/${stateSlug}/${citySlug}/${typeSlug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  // 4. Live property listing pages
  try {
    const properties = await fetchLiveProperties({});
    for (const property of properties) {
      const slug = `${slugify(property.name)}-${property.id}`;
      entries.push({
        url: `${baseUrl}/property/${slug}`,
        lastModified: new Date(property.postedDate || now),
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }
  } catch {
    // If backend is unreachable during static compilation, sitemap still renders all programmatic routes
  }

  return entries;
}
