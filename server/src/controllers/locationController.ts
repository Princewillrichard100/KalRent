import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import axios from "axios";
import {
  AutocompleteResponse,
  LocationSuggestion,
  LocationDetailsResponse,
} from "../types/location";

const prisma = new PrismaClient();

// In-memory cache with 1-hour TTL
const autocompleteCache = new Map<string, { timestamp: number; data: LocationSuggestion[] }>();
const detailsCache = new Map<string, { timestamp: number; data: LocationDetailsResponse }>();
const CACHE_TTL_MS = 60 * 60 * 1000;

interface CuratedPlace {
  place_id: string;
  name: string;
  secondary: string;
  types: string[];
  lat: number;
  lng: number;
  city: string;
  state: string;
}

const CURATED_NIGERIAN_PLACES: CuratedPlace[] = [
  // Lagos Hubs & Neighborhoods
  { place_id: "ng_lekki_lagos", name: "Lekki Phase 1", secondary: "Eti-Osa, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.4474, lng: 3.4844, city: "Lekki", state: "Lagos" },
  { place_id: "ng_lekki_peninsula", name: "Lekki", secondary: "Lagos, Nigeria", types: ["locality", "political"], lat: 6.4698, lng: 3.5852, city: "Lekki", state: "Lagos" },
  { place_id: "ng_vi_lagos", name: "Victoria Island", secondary: "Lagos Island, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.4281, lng: 3.4219, city: "Victoria Island", state: "Lagos" },
  { place_id: "ng_ikoyi_lagos", name: "Ikoyi", secondary: "Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.4549, lng: 3.4357, city: "Ikoyi", state: "Lagos" },
  { place_id: "ng_ikeja_lagos", name: "Ikeja", secondary: "Lagos State, Nigeria", types: ["locality", "political"], lat: 6.6018, lng: 3.3515, city: "Ikeja", state: "Lagos" },
  { place_id: "ng_ikeja_gra", name: "Ikeja GRA", secondary: "Ikeja, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.5905, lng: 3.3582, city: "Ikeja", state: "Lagos" },
  { place_id: "ng_yaba_lagos", name: "Yaba", secondary: "Lagos Mainland, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.5095, lng: 3.3711, city: "Yaba", state: "Lagos" },
  { place_id: "ng_surulere_lagos", name: "Surulere", secondary: "Lagos, Nigeria", types: ["locality", "political"], lat: 6.4969, lng: 3.3524, city: "Surulere", state: "Lagos" },
  { place_id: "ng_ajah_lagos", name: "Ajah", secondary: "Eti-Osa, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.4655, lng: 3.5658, city: "Ajah", state: "Lagos" },
  { place_id: "ng_sangotedo_lagos", name: "Sangotedo", secondary: "Eti-Osa, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.4719, lng: 3.6335, city: "Sangotedo", state: "Lagos" },
  { place_id: "ng_maryland_lagos", name: "Maryland", secondary: "Ikeja, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.5744, lng: 3.3678, city: "Maryland", state: "Lagos" },
  { place_id: "ng_magodo_lagos", name: "Magodo Phase 2", secondary: "Kosofe, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.6212, lng: 3.3831, city: "Magodo", state: "Lagos" },
  { place_id: "ng_oniru_lagos", name: "Oniru Estate", secondary: "Victoria Island, Lagos, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.435, lng: 3.438, city: "Oniru", state: "Lagos" },

  // Abuja (FCT)
  { place_id: "ng_maitama_abuja", name: "Maitama", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.0882, lng: 7.4934, city: "Maitama", state: "Abuja" },
  { place_id: "ng_wuse2_abuja", name: "Wuse 2", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.0765, lng: 7.4722, city: "Wuse 2", state: "Abuja" },
  { place_id: "ng_wuse_abuja", name: "Wuse Zone 4", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.0621, lng: 7.4649, city: "Wuse", state: "Abuja" },
  { place_id: "ng_garki_abuja", name: "Garki 2", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.0305, lng: 7.4912, city: "Garki", state: "Abuja" },
  { place_id: "ng_gwarinpa_abuja", name: "Gwarinpa Estate", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.1128, lng: 7.3986, city: "Gwarinpa", state: "Abuja" },
  { place_id: "ng_jabi_abuja", name: "Jabi Lake District", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.0708, lng: 7.4278, city: "Jabi", state: "Abuja" },
  { place_id: "ng_asokoro_abuja", name: "Asokoro", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.0435, lng: 7.5312, city: "Asokoro", state: "Abuja" },
  { place_id: "ng_utako_abuja", name: "Utako", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.0645, lng: 7.4398, city: "Utako", state: "Abuja" },
  { place_id: "ng_guzape_abuja", name: "Guzape", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.0125, lng: 7.5144, city: "Guzape", state: "Abuja" },
  { place_id: "ng_cbd_abuja", name: "Central Business District", secondary: "Abuja, FCT, Nigeria", types: ["neighborhood", "sublocality"], lat: 9.055, lng: 7.49, city: "Abuja", state: "Abuja" },

  // Kwara State (Ilorin & Student/Urban Hubs)
  { place_id: "ng_okeodo_ilorin", name: "Oke Odo", secondary: "Ilorin South / East, Kwara, Nigeria", types: ["neighborhood", "sublocality"], lat: 8.483, lng: 4.6015, city: "Oke Odo", state: "Kwara" },
  { place_id: "ng_tanke_ilorin", name: "Tanke", secondary: "Ilorin South, Kwara, Nigeria", types: ["neighborhood", "sublocality"], lat: 8.4799, lng: 4.5901, city: "Tanke", state: "Kwara" },
  { place_id: "ng_sanrab_ilorin", name: "Sanrab", secondary: "Tanke, Ilorin, Kwara, Nigeria", types: ["neighborhood", "sublocality"], lat: 8.4765, lng: 4.5875, city: "Sanrab", state: "Kwara" },
  { place_id: "ng_jalala_ilorin", name: "Jalala Estate", secondary: "Ilorin, Kwara, Nigeria", types: ["neighborhood", "sublocality"], lat: 8.495, lng: 4.652, city: "Jalala", state: "Kwara" },
  { place_id: "ng_mark_ilorin", name: "Mark Junction", secondary: "Tanke, Ilorin, Kwara, Nigeria", types: ["neighborhood", "sublocality"], lat: 8.4815, lng: 4.588, city: "Mark Junction", state: "Kwara" },
  { place_id: "ng_gra_ilorin", name: "GRA Ilorin", secondary: "Ilorin, Kwara, Nigeria", types: ["neighborhood", "sublocality"], lat: 8.468, lng: 4.551, city: "Ilorin", state: "Kwara" },
  { place_id: "ng_unilorin", name: "University of Ilorin Campus", secondary: "Ilorin, Kwara, Nigeria", types: ["establishment", "university"], lat: 8.479, lng: 4.674, city: "Ilorin", state: "Kwara" },
  { place_id: "ng_fate_ilorin", name: "Fate Road", secondary: "Ilorin, Kwara, Nigeria", types: ["neighborhood", "sublocality"], lat: 8.489, lng: 4.565, city: "Ilorin", state: "Kwara" },

  // Rivers State (Port Harcourt)
  { place_id: "ng_ph_rivers", name: "Port Harcourt", secondary: "Rivers State, Nigeria", types: ["locality", "political"], lat: 4.8156, lng: 7.0498, city: "Port Harcourt", state: "Rivers" },
  { place_id: "ng_oldgra_ph", name: "Old GRA", secondary: "Port Harcourt, Rivers, Nigeria", types: ["neighborhood", "sublocality"], lat: 4.792, lng: 7.009, city: "Port Harcourt", state: "Rivers" },
  { place_id: "ng_newgra_ph", name: "New GRA (GRA Phase 2)", secondary: "Port Harcourt, Rivers, Nigeria", types: ["neighborhood", "sublocality"], lat: 4.819, lng: 6.998, city: "Port Harcourt", state: "Rivers" },
  { place_id: "ng_peterodili_ph", name: "Peter Odili Road", secondary: "Trans-Amadi, Port Harcourt, Rivers, Nigeria", types: ["neighborhood", "sublocality"], lat: 4.805, lng: 7.042, city: "Port Harcourt", state: "Rivers" },
  { place_id: "ng_woji_ph", name: "Woji", secondary: "Port Harcourt, Rivers, Nigeria", types: ["neighborhood", "sublocality"], lat: 4.821, lng: 7.065, city: "Port Harcourt", state: "Rivers" },

  // Oyo State (Ibadan)
  { place_id: "ng_ibadan_oyo", name: "Ibadan", secondary: "Oyo State, Nigeria", types: ["locality", "political"], lat: 7.3775, lng: 3.947, city: "Ibadan", state: "Oyo" },
  { place_id: "ng_bodija_ibadan", name: "Bodija", secondary: "Ibadan, Oyo, Nigeria", types: ["neighborhood", "sublocality"], lat: 7.435, lng: 3.91, city: "Bodija", state: "Oyo" },
  { place_id: "ng_ringroad_ibadan", name: "Ring Road", secondary: "Ibadan, Oyo, Nigeria", types: ["neighborhood", "sublocality"], lat: 7.362, lng: 3.864, city: "Ibadan", state: "Oyo" },
  { place_id: "ng_oluyole_ibadan", name: "Oluyole Estate", secondary: "Ibadan, Oyo, Nigeria", types: ["neighborhood", "sublocality"], lat: 7.351, lng: 3.862, city: "Oluyole", state: "Oyo" },
  { place_id: "ng_ui_ibadan", name: "University of Ibadan (UI)", secondary: "Ibadan, Oyo, Nigeria", types: ["establishment", "university"], lat: 7.4443, lng: 3.9003, city: "Ibadan", state: "Oyo" },

  // Other Major Nigerian Urban Centers
  { place_id: "ng_enugu_enugu", name: "Enugu", secondary: "Enugu State, Nigeria", types: ["locality", "political"], lat: 6.4584, lng: 7.5464, city: "Enugu", state: "Enugu" },
  { place_id: "ng_indlayout_enugu", name: "Independence Layout", secondary: "Enugu, Nigeria", types: ["neighborhood", "sublocality"], lat: 6.442, lng: 7.518, city: "Enugu", state: "Enugu" },
  { place_id: "ng_calabar_crossriver", name: "Calabar", secondary: "Cross River State, Nigeria", types: ["locality", "political"], lat: 4.9757, lng: 8.3417, city: "Calabar", state: "Cross River" },
  { place_id: "ng_asaba_delta", name: "Asaba", secondary: "Delta State, Nigeria", types: ["locality", "political"], lat: 6.1984, lng: 6.7329, city: "Asaba", state: "Delta" },
  { place_id: "ng_benin_edo", name: "Benin City", secondary: "Edo State, Nigeria", types: ["locality", "political"], lat: 6.335, lng: 5.6037, city: "Benin City", state: "Edo" },
  { place_id: "ng_abeokuta_ogun", name: "Abeokuta", secondary: "Ogun State, Nigeria", types: ["locality", "political"], lat: 7.1557, lng: 3.3451, city: "Abeokuta", state: "Ogun" },
  { place_id: "ng_uyo_akwaibom", name: "Uyo", secondary: "Akwa Ibom State, Nigeria", types: ["locality", "political"], lat: 5.0377, lng: 7.9128, city: "Uyo", state: "Akwa Ibom" },
  { place_id: "ng_owerri_imo", name: "Owerri", secondary: "Imo State, Nigeria", types: ["locality", "political"], lat: 5.4836, lng: 7.0332, city: "Owerri", state: "Imo" },
  { place_id: "ng_jos_plateau", name: "Jos", secondary: "Plateau State, Nigeria", types: ["locality", "political"], lat: 9.8965, lng: 8.8583, city: "Jos", state: "Plateau" },
  { place_id: "ng_akure_ondo", name: "Akure", secondary: "Ondo State, Nigeria", types: ["locality", "political"], lat: 7.2571, lng: 5.2058, city: "Akure", state: "Ondo" },
  { place_id: "ng_kano_kano", name: "Kano", secondary: "Kano State, Nigeria", types: ["locality", "political"], lat: 12.0022, lng: 8.592, city: "Kano", state: "Kano" },
  { place_id: "ng_kaduna_kaduna", name: "Kaduna", secondary: "Kaduna State, Nigeria", types: ["locality", "political"], lat: 10.5105, lng: 7.4165, city: "Kaduna", state: "Kaduna" },
];

function buildTerms(name: string, secondary?: string): { offset: number; value: string }[] {
  const parts = [name, ...(secondary ? secondary.split(",").map((s) => s.trim()) : [])].filter(Boolean);
  let currentOffset = 0;
  return parts.map((part) => {
    const term = { offset: currentOffset, value: part };
    currentOffset += part.length + 2;
    return term;
  });
}

/**
 * GET /api/locations/autocomplete?query=...
 */
export const autocompleteLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = ((req.query.query || req.query.input || "") as string).trim();

    if (!query || query.length < 2) {
      res.json({ autocomplete_terms: [] });
      return;
    }

    const cacheKey = `ac_${query.toLowerCase()}`;
    const cached = autocompleteCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.json({ autocomplete_terms: cached.data });
      return;
    }

    const results: LocationSuggestion[] = [];
    const seenIds = new Set<string>();

    // 1. Check Google Places API if key provided
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (googleApiKey) {
      try {
        const gResponse = await axios.get(
          "https://maps.googleapis.com/maps/api/place/autocomplete/json",
          {
            params: {
              input: query,
              components: "country:ng",
              types: "geocode|establishment",
              key: googleApiKey,
            },
            timeout: 3000,
          }
        );

        if (gResponse.data?.predictions?.length) {
          for (const pred of gResponse.data.predictions) {
            if (!seenIds.has(pred.place_id)) {
              seenIds.add(pred.place_id);
              results.push({
                id: pred.place_id,
                place_id: pred.place_id,
                display_name: pred.structured_formatting?.main_text || pred.description,
                secondary_text: pred.structured_formatting?.secondary_text || "Nigeria",
                types: pred.types || ["geocode"],
                terms: (pred.terms || []).map((t: any) => ({
                  offset: t.offset || 0,
                  value: t.value || "",
                })),
                query,
              });
            }
          }
        }
      } catch (err: any) {
        console.warn("Google Places Autocomplete failed, falling back to local dataset:", err.message);
      }
    }

    // 2. Search Curated Nigerian Places (fast in-memory lookup)
    const qLower = query.toLowerCase();
    for (const place of CURATED_NIGERIAN_PLACES) {
      if (
        place.name.toLowerCase().includes(qLower) ||
        place.secondary.toLowerCase().includes(qLower) ||
        place.city.toLowerCase().includes(qLower) ||
        place.state.toLowerCase().includes(qLower)
      ) {
        if (!seenIds.has(place.place_id)) {
          seenIds.add(place.place_id);
          results.push({
            id: place.place_id,
            place_id: place.place_id,
            display_name: place.name,
            secondary_text: place.secondary,
            types: place.types,
            terms: buildTerms(place.name, place.secondary),
            query,
            lat: place.lat,
            lng: place.lng,
          });
        }
      }
    }

    // 3. Search distinct Location and Property columns from Database
    try {
      const dbLocations = await prisma.$queryRaw<any[]>`
        SELECT DISTINCT 
          l.id as location_id,
          l.city,
          l.state,
          l.address,
          p.landmark,
          p."campusZone",
          ST_X(l.coordinates::geometry) as lng,
          ST_Y(l.coordinates::geometry) as lat
        FROM "Location" l
        LEFT JOIN "Property" p ON p."locationId" = l.id
        WHERE l.city ILIKE ${"%" + query + "%"}
           OR l.state ILIKE ${"%" + query + "%"}
           OR l.address ILIKE ${"%" + query + "%"}
           OR p.landmark ILIKE ${"%" + query + "%"}
           OR p."campusZone"::text ILIKE ${"%" + query + "%"}
        LIMIT 10
      `;

      for (const loc of dbLocations) {
        const displayName = loc.landmark || loc.campusZone || loc.address || loc.city;
        const secondary = `${loc.city ? loc.city + ", " : ""}${loc.state || "Nigeria"}`;
        const placeId = `db_loc_${loc.location_id}`;

        if (!seenIds.has(placeId) && displayName) {
          seenIds.add(placeId);
          results.push({
            id: placeId,
            place_id: placeId,
            display_name: displayName,
            secondary_text: secondary,
            types: ["neighborhood", "sublocality"],
            terms: buildTerms(displayName, secondary),
            query,
            lat: loc.lat ? parseFloat(loc.lat) : undefined,
            lng: loc.lng ? parseFloat(loc.lng) : undefined,
          });
        }
      }
    } catch (dbErr: any) {
      console.warn("DB location search fallback note:", dbErr.message);
    }

    // 4. If fewer than 3 results, query Photon OpenStreetMap (Zero-key live fallback restricted to Nigeria)
    if (results.length < 3) {
      try {
        const osmRes = await axios.get("https://photon.komoot.io/api/", {
          params: {
            q: query,
            bbox: "2.6769,4.2725,14.678,13.892", // Nigeria bounding box
            limit: 6,
          },
          timeout: 2500,
        });

        if (osmRes.data?.features?.length) {
          for (const feat of osmRes.data.features) {
            const props = feat.properties || {};
            const coords = feat.geometry?.coordinates || [];
            const osmId = `osm_${props.osm_id || props.name}`;

            if (!seenIds.has(osmId) && props.name) {
              seenIds.add(osmId);
              const secParts = [props.city || props.district, props.state, props.country || "Nigeria"].filter(Boolean);
              const secondary = secParts.join(", ");

              results.push({
                id: osmId,
                place_id: osmId,
                display_name: props.name,
                secondary_text: secondary,
                types: [props.osm_value || "political"],
                terms: buildTerms(props.name, secondary),
                query,
                lat: coords[1],
                lng: coords[0],
              });
            }
          }
        }
      } catch (osmErr: any) {
        // Silent fallback
      }
    }

    // Cache top 15 results
    const topResults = results.slice(0, 15);
    autocompleteCache.set(cacheKey, { timestamp: Date.now(), data: topResults });

    const responsePayload: AutocompleteResponse = {
      autocomplete_terms: topResults,
    };

    res.json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ message: `Error resolving autocomplete: ${error.message}` });
  }
};

/**
 * GET /api/locations/details?place_id=...
 */
export const getLocationDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const placeId = (req.query.place_id || req.query.placeId) as string;

    if (!placeId) {
      res.status(400).json({ message: "place_id query param is required" });
      return;
    }

    const cacheKey = `details_${placeId}`;
    const cached = detailsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      res.json(cached.data);
      return;
    }

    // 1. Check curated list
    const curated = CURATED_NIGERIAN_PLACES.find((p) => p.place_id === placeId);
    if (curated) {
      const details: LocationDetailsResponse = {
        place_id: curated.place_id,
        display_name: `${curated.name}, ${curated.secondary}`,
        lat: curated.lat,
        lng: curated.lng,
        city: curated.city,
        state: curated.state,
        country: "Nigeria",
        viewport: {
          northeast: { lat: curated.lat + 0.05, lng: curated.lng + 0.05 },
          southwest: { lat: curated.lat - 0.05, lng: curated.lng - 0.05 },
        },
      };
      detailsCache.set(cacheKey, { timestamp: Date.now(), data: details });
      res.json(details);
      return;
    }

    // 2. Check Database location ID
    if (placeId.startsWith("db_loc_")) {
      const locationId = parseInt(placeId.replace("db_loc_", ""), 10);
      const loc = await prisma.$queryRaw<any[]>`
        SELECT 
          l.id,
          l.city,
          l.state,
          l.address,
          l.country,
          ST_X(l.coordinates::geometry) as lng,
          ST_Y(l.coordinates::geometry) as lat
        FROM "Location" l
        WHERE l.id = ${locationId}
        LIMIT 1
      `;

      if (loc && loc.length > 0) {
        const item = loc[0];
        const lat = parseFloat(item.lat);
        const lng = parseFloat(item.lng);
        const details: LocationDetailsResponse = {
          place_id: placeId,
          display_name: `${item.address ? item.address + ", " : ""}${item.city}, ${item.state}`,
          lat,
          lng,
          city: item.city,
          state: item.state,
          country: item.country || "Nigeria",
          viewport: {
            northeast: { lat: lat + 0.05, lng: lng + 0.05 },
            southwest: { lat: lat - 0.05, lng: lng - 0.05 },
          },
        };
        detailsCache.set(cacheKey, { timestamp: Date.now(), data: details });
        res.json(details);
        return;
      }
    }

    // 3. Check Google Places details if key available
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (googleApiKey) {
      try {
        const gDetails = await axios.get(
          "https://maps.googleapis.com/maps/api/place/details/json",
          {
            params: {
              place_id: placeId,
              fields: "geometry,formatted_address,name,address_components",
              key: googleApiKey,
            },
            timeout: 3000,
          }
        );

        const result = gDetails.data?.result;
        if (result?.geometry?.location) {
          const lat = result.geometry.location.lat;
          const lng = result.geometry.location.lng;
          const details: LocationDetailsResponse = {
            place_id: placeId,
            display_name: result.formatted_address || result.name,
            lat,
            lng,
            country: "Nigeria",
            viewport: result.geometry.viewport,
          };
          detailsCache.set(cacheKey, { timestamp: Date.now(), data: details });
          res.json(details);
          return;
        }
      } catch (err: any) {
        console.warn("Google place details error:", err.message);
      }
    }

    // Fallback: If not found, return approximate default
    res.status(404).json({ message: "Location coordinates not found" });
  } catch (error: any) {
    res.status(500).json({ message: `Error retrieving location details: ${error.message}` });
  }
};
