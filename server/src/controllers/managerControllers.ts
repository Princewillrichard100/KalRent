import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const manager = await prisma.manager.findUnique({
      where: { cognitoId },
    });

    if (manager) {
      res.json(manager);
    } else {
      res.status(404).json({ message: "Manager not found" });
    }
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager: ${error.message}` });
  }
};

export const createManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId, name, email, phoneNumber } = req.body;

    const manager = await prisma.manager.create({
      data: {
        cognitoId,
        name,
        email,
        phoneNumber,
      },
    });

    res.status(201).json(manager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating manager: ${error.message}` });
  }
};

export const updateManager = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const { name, email, phoneNumber } = req.body;

    const updateManager = await prisma.manager.update({
      where: { cognitoId },
      data: {
        name,
        email,
        phoneNumber,
      },
    });

    res.json(updateManager);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating manager: ${error.message}` });
  }
};

export const getManagerProperties = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { cognitoId } = req.params;
    const properties = await prisma.property.findMany({
      where: { managerCognitoId: cognitoId },
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

    const propertiesWithFormattedLocation = properties.map((property) => {
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

    res.json(propertiesWithFormattedLocation);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: `Error retrieving manager properties: ${err.message}` });
  }
};
