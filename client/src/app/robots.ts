import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/rent/",
          "/property/",
          "/listings/",
          "/search",
          "/s/",
          "/landing",
        ],
        disallow: [
          "/dashboard/",
          "/managers/",
          "/tenants/",
          "/api/",
          "/_next/",
          "/*.json$",
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/", "/rent/", "/property/", "/llms.txt"],
        disallow: ["/dashboard/", "/managers/", "/tenants/", "/api/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: ["/", "/rent/", "/property/", "/llms.txt"],
        disallow: ["/dashboard/", "/managers/", "/tenants/", "/api/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: ["/", "/rent/", "/property/", "/llms.txt"],
        disallow: ["/dashboard/", "/managers/", "/tenants/", "/api/"],
      },
    ],
    sitemap: "https://kalrent.com.ng/sitemap.xml",
  };
}
