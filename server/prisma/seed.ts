import { PrismaClient, Prisma } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const CLUSTERS = [
  { address: "Ikoyi", city: "Lagos", state: "Lagos", country: "Nigeria", lat: 6.4531, lng: 3.4395, basePrice: 15000000, type: "Villa" },
  { address: "Victoria Island", city: "Lagos", state: "Lagos", country: "Nigeria", lat: 6.4281, lng: 3.4219, basePrice: 10000000, type: "Apartment" },
  { address: "Lekki Phase 1", city: "Lagos", state: "Lagos", country: "Nigeria", lat: 6.4449, lng: 3.4691, basePrice: 8000000, type: "Townhouse" },
  { address: "Ikeja GRA", city: "Lagos", state: "Lagos", country: "Nigeria", lat: 6.5965, lng: 3.3421, basePrice: 4000000, type: "Apartment" },
  { address: "Surulere", city: "Lagos", state: "Lagos", country: "Nigeria", lat: 6.4962, lng: 3.3486, basePrice: 3000000, type: "Apartment" },
  { address: "Yaba", city: "Lagos", state: "Lagos", country: "Nigeria", lat: 6.5095, lng: 3.3711, basePrice: 2500000, type: "Apartment" },
  { address: "Arepo", city: "Ogun", state: "Ogun", country: "Nigeria", lat: 6.6908, lng: 3.4475, basePrice: 1500000, type: "Townhouse" },
  { address: "Mowe", city: "Ogun", state: "Ogun", country: "Nigeria", lat: 6.8080, lng: 3.4402, basePrice: 800000, type: "Apartment" },
  { address: "Magboro", city: "Ogun", state: "Ogun", country: "Nigeria", lat: 6.7214, lng: 3.4357, basePrice: 1000000, type: "Apartment" },
  { address: "Bodija", city: "Ibadan", state: "Oyo", country: "Nigeria", lat: 7.4289, lng: 3.9100, basePrice: 3000000, type: "Villa" },
  { address: "Agodi", city: "Ibadan", state: "Oyo", country: "Nigeria", lat: 7.3999, lng: 3.9015, basePrice: 2000000, type: "Apartment" },
  { address: "Oluyole", city: "Ibadan", state: "Oyo", country: "Nigeria", lat: 7.3481, lng: 3.8617, basePrice: 1500000, type: "Apartment" },
];

const UNSPLASH_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
  "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800",
  "https://images.unsplash.com/photo-1512915922686-57c11dde9b6b?w=800",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800",
];

function getLocalImages() {
  const images: string[] = [];
  const clientPublic = path.join(__dirname, "../../client/public");
  const dirsToScan = ["images", "listings"];
  
  for (const dir of dirsToScan) {
    const fullPath = path.join(clientPublic, dir);
    if (fs.existsSync(fullPath)) {
      const files = fs.readdirSync(fullPath);
      for (const file of files) {
        if (file.match(/\.(png|jpe?g|webp)$/i)) {
          images.push(`/${dir}/${file}`);
        }
      }
    }
  }
  return images;
}

const AMENITIES = ["WasherDryer", "AirConditioning", "Dishwasher", "HighSpeedInternet", "HardwoodFloors", "WalkInClosets", "Microwave", "Refrigerator", "Pool", "Gym", "Parking", "PetsAllowed", "WiFi"];
const HIGHLIGHTS = ["HighSpeedInternetAccess", "WasherDryer", "AirConditioning", "Heating", "SmokeFree", "CableReady", "SatelliteTV", "DoubleVanities", "TubShower", "Intercom", "SprinklerSystem", "RecentlyRenovated", "CloseToTransit", "GreatView", "QuietNeighborhood"];
const LUXURY_ADJECTIVES = ["Luxury", "Stunning", "Modern", "Beautiful", "Spacious", "Cozy", "Elegant", "Premium"];

async function main() {
  console.log("Cleaning database...");
  await prisma.$executeRaw`TRUNCATE TABLE "Property", "Location", "Manager", "Tenant", "Lease", "Application", "Payment", "EscrowHold", "Transaction" RESTART IDENTITY CASCADE`;

  const manager = await prisma.manager.create({
    data: {
      cognitoId: "mgr-123",
      name: "KalRent Properties",
      email: "host@kalrent.com",
      phoneNumber: "+2348000000000"
    }
  });

  const tenant = await prisma.tenant.create({
    data: {
      cognitoId: "tnt-123",
      name: "John Doe",
      email: "tenant@kalrent.com",
      phoneNumber: "+2348000000001"
    }
  });

  const localImages = getLocalImages();
  const allImages = localImages.length >= 20 ? localImages : [...localImages, ...UNSPLASH_IMAGES];

  console.log(`Seeding 100 properties... (Found ${localImages.length} local images)`);

  let leaseCount = 0;

  for (let i = 0; i < 100; i++) {
    const cluster = CLUSTERS[i % CLUSTERS.length];
    
    const lat = cluster.lat + (Math.random() - 0.5) * 0.015;
    const lng = cluster.lng + (Math.random() - 0.5) * 0.015;

    const locationResult = await prisma.$queryRaw<{ id: number }[]>`
      INSERT INTO "Location" (address, city, state, country, "postalCode", coordinates)
      VALUES (${cluster.address}, ${cluster.city}, ${cluster.state}, ${cluster.country}, '100001', ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography)
      RETURNING id;
    `;
    const locationId = locationResult[0].id;

    const propertyImages = [];
    const numImages = Math.floor(Math.random() * 3) + 3;
    for (let j = 0; j < numImages; j++) {
      propertyImages.push(allImages[Math.floor(Math.random() * allImages.length)]);
    }

    const rent = cluster.basePrice + (Math.random() * 0.4 - 0.2) * cluster.basePrice;
    const adjective = LUXURY_ADJECTIVES[Math.floor(Math.random() * LUXURY_ADJECTIVES.length)];

    const property = await prisma.property.create({
      data: {
        name: `${adjective} ${cluster.type} in ${cluster.address}, ${cluster.city}`,
        description: `Beautiful ${cluster.type.toLowerCase()} located in the heart of ${cluster.address}, ${cluster.city}. Offers great amenities and a comfortable stay.`,
        annualRent: Math.round(rent),
        agentFee: Math.round(rent * 0.1),
        cautionDeposit: Math.round(rent * 0.1),
        platformFee: Math.round(rent * 0.05),
        campusZone: "Other",
        landmark: `${cluster.address} Central`,
        photoUrls: propertyImages,
        amenities: {
          set: Array.from({length: 4}, () => AMENITIES[Math.floor(Math.random() * AMENITIES.length)]) as any[]
        },
        highlights: {
          set: Array.from({length: 3}, () => HIGHLIGHTS[Math.floor(Math.random() * HIGHLIGHTS.length)]) as any[]
        },
        isParkingIncluded: Math.random() > 0.5,
        beds: Math.floor(Math.random() * 4) + 1,
        baths: Math.floor(Math.random() * 3) + 1,
        propertyType: cluster.type as any,
        locationId,
        managerCognitoId: manager.cognitoId,
        averageRating: 3.5 + Math.random() * 1.5,
        numberOfReviews: Math.floor(Math.random() * 100),
      }
    });

    if (leaseCount < 20 && Math.random() > 0.7) {
      await prisma.lease.create({
        data: {
          startDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30))),
          endDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30) + 365)),
          annualRent: property.annualRent,
          cautionDeposit: property.cautionDeposit,
          agentFee: property.agentFee,
          platformFee: property.platformFee,
          status: "ACTIVE",
          propertyId: property.id,
          tenantCognitoId: tenant.cognitoId,
        }
      });
      leaseCount++;
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
