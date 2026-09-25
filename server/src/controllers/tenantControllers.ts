import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTenant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    let tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: {
        favorites: true,
      },
    });

    if (!tenant) {
      const manager = await prisma.manager.findUnique({
        where: { cognitoId },
      });
      if (manager) {
        tenant = await prisma.tenant.upsert({
          where: { cognitoId },
          update: {},
          create: {
            cognitoId,
            name: manager.name,
            email: manager.email,
            phoneNumber: manager.phoneNumber,
          },
          include: {
            favorites: true,
          },
        });
      }
    }

    if (tenant) {
      res.json(tenant);
    } else {
      res.status(404).json({ message: "Tenant not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving tenant: ${error.message}` });
  }
};

export const createTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const tenant = await prisma.tenant.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(tenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating tenant: ${error.message}` });
  }
};

export const updateTenant = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updateTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateTenant);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating tenant: ${error.message}` });
  }
};

export const getCurrentResidences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const properties = await prisma.property.findMany({
      where: { tenants: { some: { cognitoId } } },
      include: {
        location: true,
      },
    });

    if (properties.length === 0) {
      res.json([]);
      return;
    }

    // Performance Optimization: Batch fetch location coordinates in a single PostGIS query
    // instead of firing N individual queries in a loop (resolves N+1 query bottleneck).
    const locationIds = Array.from(
      new Set(properties.map((p) => p.location.id))
    );

    const rawCoords = await prisma.$queryRaw<
      { id: number; longitude: number; latitude: number }[]
    >`
      SELECT id, ST_X(coordinates::geometry) as longitude, ST_Y(coordinates::geometry) as latitude
      FROM "Location"
      WHERE id = ANY(${locationIds})
    `;

    const coordsMap = new Map<
      number,
      { longitude: number; latitude: number }
    >();
    for (const c of rawCoords) {
      coordsMap.set(c.id, {
        longitude: c.longitude !== null ? Number(c.longitude) : 0,
        latitude: c.latitude !== null ? Number(c.latitude) : 0,
      });
    }

    const residencesWithFormattedLocation = properties.map((property) => {
      const coords = coordsMap.get(property.location.id) || {
        longitude: 0,
        latitude: 0,
      };

      return {
        ...property,
        location: {
          ...property.location,
          coordinates: coords,
        },
      };
    });

    res.json(residencesWithFormattedLocation);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager properties: ${err.message}` });
  }
};

export const addFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    let tenant = await prisma.tenant.findUnique({
      where: { cognitoId },
      include: { favorites: true },
    });

    if (!tenant) {
      const manager = await prisma.manager.findUnique({
        where: { cognitoId },
      });
      if (manager) {
        tenant = await prisma.tenant.upsert({
          where: { cognitoId },
          update: {},
          create: {
            cognitoId,
            name: manager.name,
            email: manager.email,
            phoneNumber: manager.phoneNumber,
          },
          include: { favorites: true },
        });
      }
    }

    if (!tenant) {
      res.status(404).json({ message: "Tenant not found" });
      return;
    }

    const propertyIdNumber = Number(propertyId);
    const existingFavorites = tenant.favorites || [];

    if (!existingFavorites.some((fav) => fav.id === propertyIdNumber)) {
      const updatedTenant = await prisma.tenant.update({
        where: { cognitoId },
        data: {
          favorites: {
            connect: { id: propertyIdNumber },
          },
        },
        include: { favorites: true },
      });
      res.json(updatedTenant);
    } else {
      res.status(409).json({ message: "Property already added as favorite" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error adding favorite property: ${error.message}` });
  }
};

export const removeFavoriteProperty = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, propertyId } = req.params;
    const propertyIdNumber = Number(propertyId);

    const updatedTenant = await prisma.tenant.update({
      where: { cognitoId },
      data: {
        favorites: {
          disconnect: { id: propertyIdNumber },
        },
      },
      include: { favorites: true },
    });

    res.json(updatedTenant);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error removing favorite property: ${err.message}` });
  }
};
