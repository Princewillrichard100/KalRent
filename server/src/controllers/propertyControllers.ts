import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";
import { wktToGeoJSON } from "@terraformer/wkt";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Location } from "@prisma/client";
import { Upload } from "@aws-sdk/lib-storage";
import { Readable } from "stream";
import axios from "axios";

const prisma = new PrismaClient();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
  ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      }
    : {}),
});

export const normalizePhotoUrls = (photoUrls: string[]): string[] => {
  const baseUrl =
    process.env.API_BASE_URL ||
    `http://localhost:${process.env.PORT || 3002}`;

  return (photoUrls || []).map((url) => {
    if (url && url.includes(".r2.cloudflarestorage.com/")) {
      const key = url.split(".r2.cloudflarestorage.com/")[1];
      return process.env.R2_PUBLIC_URL
        ? `${process.env.R2_PUBLIC_URL}/${key}`
        : `${baseUrl}/photos/${key}`;
    }
    return url;
  });
};

export const getPropertyPhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawKey = req.params[0] || (req.params as any).key;
    if (!rawKey) {
      res.status(400).json({ message: "Photo key is required" });
      return;
    }

    const key = decodeURIComponent(rawKey);
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME!,
      Key: key,
    });

    const s3Response = await s3Client.send(command);

    if (s3Response.ContentType) {
      res.setHeader("Content-Type", s3Response.ContentType);
    }
    if (s3Response.ContentLength) {
      res.setHeader("Content-Length", s3Response.ContentLength);
    }
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    if (s3Response.Body instanceof Readable) {
      s3Response.Body.pipe(res);
    } else {
      const body: any = s3Response.Body;
      if (body && typeof body.pipe === "function") {
        body.pipe(res);
      } else {
        const byteArray = await s3Response.Body?.transformToByteArray();
        if (byteArray) {
          res.send(Buffer.from(byteArray));
        } else {
          res.status(404).json({ message: "Photo stream empty" });
        }
      }
    }
  } catch (error: any) {
    if (error.name === "NoSuchKey") {
      res.status(404).json({ message: "Photo not found" });
    } else {
      res
        .status(500)
        .json({ message: `Error retrieving photo: ${error.message}` });
    }
  }
};

export const CAMPUS_ZONE_COORDINATES: Record<string, [number, number]> = {
  // [longitude, latitude] - campus zones in Ilorin, Kwara State
  Tanke: [4.5901, 8.4799],
  Sanrab: [4.5875, 8.4765],
  OkeOdo: [4.6015, 8.483],
  Jalala: [4.652, 8.495],
  MarkJunction: [4.588, 8.4815],
  Other: [4.6, 8.48],
};

export const getProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      favoriteIds,
      priceMin,
      priceMax,
      beds,
      baths,
      propertyType,
      category,
      locationValue,
      guestCount,
      roomCount,
      bathroomCount,
      startDate,
      endDate,
      campusZone,
      amenities,
      availableFrom,
      latitude,
      longitude,
      userLat,
      userLng,
      sortBy,
      lat,
      lng,
      radius,
    } = req.query;

    const searchLat = lat || latitude;
    const searchLng = lng || longitude;
    const hasSearchCoords =
      searchLat !== undefined &&
      searchLng !== undefined &&
      searchLat !== "" &&
      searchLng !== "" &&
      !isNaN(parseFloat(searchLat as string)) &&
      !isNaN(parseFloat(searchLng as string));

    const effectiveLat = hasSearchCoords ? searchLat : userLat;
    const effectiveLng = hasSearchCoords ? searchLng : userLng;

    const hasUserCoords =
      effectiveLat !== undefined &&
      effectiveLng !== undefined &&
      effectiveLat !== "" &&
      effectiveLng !== "" &&
      !isNaN(parseFloat(effectiveLat as string)) &&
      !isNaN(parseFloat(effectiveLng as string));

    const parsedUserLat = hasUserCoords ? parseFloat(effectiveLat as string) : 0;
    const parsedUserLng = hasUserCoords ? parseFloat(effectiveLng as string) : 0;

    let whereConditions: Prisma.Sql[] = [];

    if (favoriteIds) {
      const favoriteIdsArray = (favoriteIds as string).split(",").map(Number);
      whereConditions.push(
        Prisma.sql`p.id IN (${Prisma.join(favoriteIdsArray)})`
      );
    }

    if (priceMin) {
      whereConditions.push(
        Prisma.sql`p."annualRent" >= ${Number(priceMin)}`
      );
    }

    if (priceMax) {
      whereConditions.push(
        Prisma.sql`p."annualRent" <= ${Number(priceMax)}`
      );
    }

    const effectiveBeds = roomCount || guestCount || beds;
    if (effectiveBeds && effectiveBeds !== "any") {
      whereConditions.push(Prisma.sql`p.beds >= ${Number(effectiveBeds)}`);
    }

    const effectiveBaths = bathroomCount || baths;
    if (effectiveBaths && effectiveBaths !== "any") {
      whereConditions.push(Prisma.sql`p.baths >= ${Number(effectiveBaths)}`);
    }

    if (campusZone && campusZone !== "any") {
      whereConditions.push(
        Prisma.sql`p."campusZone" = ${campusZone}::"CampusZone"`
      );
    }

    const categoryParam = category || propertyType;
    if (categoryParam && categoryParam !== "any") {
      whereConditions.push(
        Prisma.sql`(
          p."propertyType"::text ILIKE ${"%" + categoryParam + "%"} 
          OR p.name ILIKE ${"%" + categoryParam + "%"} 
          OR p.description ILIKE ${"%" + categoryParam + "%"}
          OR p.amenities::text ILIKE ${"%" + categoryParam + "%"}
        )`
      );
    }

    if (locationValue && locationValue !== "any") {
      whereConditions.push(
        Prisma.sql`(
          l.address ILIKE ${"%" + locationValue + "%"} 
          OR l.city ILIKE ${"%" + locationValue + "%"} 
          OR p.landmark ILIKE ${"%" + locationValue + "%"} 
          OR p."campusZone"::text ILIKE ${"%" + locationValue + "%"}
        )`
      );
    }

    if (startDate && endDate) {
      const sDate = new Date(startDate as string);
      const eDate = new Date(endDate as string);
      if (!isNaN(sDate.getTime()) && !isNaN(eDate.getTime())) {
        whereConditions.push(
          Prisma.sql`NOT EXISTS (
            SELECT 1 FROM "Lease" lease 
            WHERE lease."propertyId" = p.id 
            AND lease.status IN ('ACTIVE', 'PENDING_PAYMENT')
            AND lease."startDate" <= ${eDate.toISOString()}::timestamp
            AND lease."endDate" >= ${sDate.toISOString()}::timestamp
          )`
        );
      }
    }

    if (amenities && amenities !== "any") {
      const amenitiesArray = (amenities as string).split(",");
      whereConditions.push(Prisma.sql`p.amenities @> ${amenitiesArray}`);
    }

    if (availableFrom && availableFrom !== "any") {
      const availableFromDate =
        typeof availableFrom === "string" ? availableFrom : null;
      if (availableFromDate) {
        const date = new Date(availableFromDate);
        if (!isNaN(date.getTime())) {
          whereConditions.push(
            Prisma.sql`EXISTS (
              SELECT 1 FROM "Lease" l 
              WHERE l."propertyId" = p.id 
              AND l."startDate" <= ${date.toISOString()}::timestamp
            )`
          );
        }
      }
    }

    if (hasSearchCoords) {
      const radiusMeters = radius ? parseFloat(radius as string) : 25000;
      whereConditions.push(
        Prisma.sql`ST_DWithin(
          l.coordinates,
          ST_SetSRID(ST_MakePoint(${parsedUserLng}, ${parsedUserLat}), 4326)::geography,
          ${radiusMeters}
        )`
      );
    }

    const completeQuery = Prisma.sql`
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location
        ${
          hasUserCoords
            ? Prisma.sql`, ST_Distance(l.coordinates, ST_SetSRID(ST_MakePoint(${parsedUserLng}, ${parsedUserLat}), 4326)::geography) as "distanceMeters"`
            : Prisma.empty
        }
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      ${
        whereConditions.length > 0
          ? Prisma.sql`WHERE ${Prisma.join(whereConditions, " AND ")}`
          : Prisma.empty
      }
      ${
        hasUserCoords && sortBy !== "newest"
          ? Prisma.sql`ORDER BY "distanceMeters" ASC`
          : Prisma.sql`ORDER BY p."postedDate" DESC`
      }
    `;

    const properties = await prisma.$queryRaw<any[]>(completeQuery);
    const normalizedProperties = properties.map((p) => {
      const distanceKm =
        p.distanceMeters !== undefined && p.distanceMeters !== null
          ? Math.round((Number(p.distanceMeters) / 1000) * 10) / 10
          : undefined;

      return {
        ...p,
        distanceKm,
        distance_km: distanceKm,
        photoUrls: normalizePhotoUrls(p.photoUrls),
      };
    });

    res.json(normalizedProperties);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving properties: ${error.message}` });
  }
};

export const getNearbyProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  const lat = parseFloat((req.query.lat || req.query.userLat) as string);
  const lng = parseFloat((req.query.lng || req.query.userLng) as string);
  const radiusMeters = parseFloat(req.query.radius as string) || 25000;
  const limit = parseInt(req.query.limit as string) || 30;

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ error: "Valid lat and lng query params are required" });
    return;
  }

  try {
    const properties = await prisma.$queryRaw<any[]>`
      SELECT 
        p.*,
        json_build_object(
          'id', l.id,
          'address', l.address,
          'city', l.city,
          'state', l.state,
          'country', l.country,
          'postalCode', l."postalCode",
          'coordinates', json_build_object(
            'longitude', ST_X(l."coordinates"::geometry),
            'latitude', ST_Y(l."coordinates"::geometry)
          )
        ) as location,
        ROUND((ST_Distance(
          l.coordinates, 
          ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)::geography
        ) / 1000)::numeric, 1) AS "distanceKm"
      FROM "Property" p
      JOIN "Location" l ON p."locationId" = l.id
      WHERE ST_DWithin(
        l.coordinates,
        ST_SetSRID(ST_Point(${lng}, ${lat}), 4326)::geography,
        ${radiusMeters}
      )
      ORDER BY "distanceKm" ASC
      LIMIT ${limit};
    `;

    const normalized = properties.map((p) => {
      const distanceKm =
        p.distanceKm !== undefined && p.distanceKm !== null
          ? Number(p.distanceKm)
          : undefined;

      return {
        ...p,
        distanceKm,
        distance_km: distanceKm,
        photoUrls: normalizePhotoUrls(p.photoUrls),
      };
    });

    res.json({ listings: normalized, properties: normalized });
  } catch (error: any) {
    console.error("Failed to query nearby listings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: { id: Number(id) },
      include: {
        location: true,
      },
    });

    if (property) {
      const coordinates: { coordinates: string }[] =
        await prisma.$queryRaw`SELECT ST_asText(coordinates) as coordinates from "Location" where id = ${property.location.id}`;

      const geoJSON: any = wktToGeoJSON(coordinates[0]?.coordinates || "");
      const longitude = geoJSON.coordinates[0];
      const latitude = geoJSON.coordinates[1];

      const propertyWithCoordinates = {
        ...property,
        photoUrls: normalizePhotoUrls(property.photoUrls),
        location: {
          ...property.location,
          coordinates: {
            longitude,
            latitude,
          },
        },
      };
      res.json(propertyWithCoordinates);
    }
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property: ${err.message}` });
  }
};

export const createProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    const {
      address,
      city,
      state,
      country,
      postalCode,
      managerCognitoId,
      ...propertyData
    } = req.body;

    const baseUrl =
      process.env.API_BASE_URL ||
      `http://localhost:${process.env.PORT || 3002}`;

    const photoUrls = await Promise.all(
      files.map(async (file) => {
        const key = `properties/${Date.now()}-${file.originalname}`;
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME!,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
        };

        await new Upload({
          client: s3Client,
          params: uploadParams,
        }).done();

        return process.env.R2_PUBLIC_URL
          ? `${process.env.R2_PUBLIC_URL}/${encodeURI(key)}`
          : `${baseUrl}/photos/${encodeURI(key)}`;
      })
    );

    const annualRent = parseFloat(propertyData.annualRent);
    if (isNaN(annualRent) || annualRent <= 0) {
      res.status(400).json({ message: "annualRent must be a positive number" });
      return;
    }

    const agentFee = parseFloat(propertyData.agentFee || "0");
    const maxAgentFee = annualRent * 0.1;
    if (agentFee > maxAgentFee) {
      res.status(400).json({
        message: `Agent fee cannot exceed 10% of annual rent. Max allowed: ${maxAgentFee}, provided: ${agentFee}`,
      });
      return;
    }

    const cautionDeposit = parseFloat(propertyData.cautionDeposit || "0");
    const platformFee = annualRent * 0.05; // Auto-calculate as 5% of annualRent

    let longitude = 0;
    let latitude = 0;

    try {
      const geocodingUrl = `https://nominatim.openstreetmap.org/search?${new URLSearchParams(
        {
          street: address,
          city,
          country: country || "Nigeria",
          postalcode: postalCode || "",
          format: "json",
          limit: "1",
        }
      ).toString()}`;
      const geocodingResponse = await axios.get(geocodingUrl, {
        headers: {
          "User-Agent": "KalRent/1.0 (contact@kalrent.ng)",
        },
        timeout: 3000,
      });

      if (geocodingResponse.data[0]?.lon && geocodingResponse.data[0]?.lat) {
        longitude = parseFloat(geocodingResponse.data[0].lon);
        latitude = parseFloat(geocodingResponse.data[0].lat);
      }
    } catch {
      // Nominatim failed, timed out, or rate-limited; fallback to campus zone coordinates
    }

    // Fallback gracefully to fixed campusZone coordinates rather than saving [0,0]
    if (
      (longitude === 0 && latitude === 0) ||
      isNaN(longitude) ||
      isNaN(latitude)
    ) {
      const zoneCoords =
        CAMPUS_ZONE_COORDINATES[propertyData.campusZone] ||
        CAMPUS_ZONE_COORDINATES.Other;
      [longitude, latitude] = zoneCoords;
    }

    // create location
    const [location] = await prisma.$queryRaw<Location[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${address}, ${city}, ${state}, ${country}, ${postalCode}, ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326))
      RETURNING id, address, city, state, country, "postalCode", ST_AsText(coordinates) as coordinates;
    `;

    // create property
    const newProperty = await prisma.property.create({
      data: {
        ...propertyData,
        photoUrls,
        locationId: location.id,
        managerCognitoId,
        campusZone: propertyData.campusZone,
        landmark: propertyData.landmark || "",
        annualRent,
        agentFee,
        cautionDeposit,
        platformFee,
        amenities:
          typeof propertyData.amenities === "string"
            ? propertyData.amenities.startsWith("[")
              ? JSON.parse(propertyData.amenities)
              : propertyData.amenities.split(",").map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(propertyData.amenities)
            ? propertyData.amenities
            : [],
        highlights:
          typeof propertyData.highlights === "string"
            ? propertyData.highlights.startsWith("[")
              ? JSON.parse(propertyData.highlights)
              : propertyData.highlights.split(",").map((s: string) => s.trim()).filter(Boolean)
            : Array.isArray(propertyData.highlights)
            ? propertyData.highlights
            : [],
        isParkingIncluded: propertyData.isParkingIncluded === "true",
        beds: parseInt(propertyData.beds),
        baths: parseFloat(propertyData.baths),
      },
      include: {
        location: true,
        manager: true,
      },
    });

    res.status(201).json(newProperty);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error creating property: ${err.message}` });
  }
};
