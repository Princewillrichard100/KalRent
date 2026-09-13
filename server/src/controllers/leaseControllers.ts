import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { generateTenancyAgreement } from "../services/agreement.service";
import { getLeaseLifecycleById } from "../services/leaseLifecycle.service";

const prisma = new PrismaClient();

export const getLeases = async (req: Request, res: Response): Promise<void> => {
  try {
    const leases = await prisma.lease.findMany({
      include: {
        tenant: true,
        property: true,
      },
    });
    res.json(leases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving leases: ${error.message}` });
  }
};

export const getLeasePayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    let payments = await prisma.payment.findMany({
      where: { leaseId: numericId },
    });

    // Handle parameter mismatch if caller provided propertyId instead of leaseId
    if (payments.length === 0) {
      const propertyPayments = await prisma.payment.findMany({
        where: {
          lease: {
            propertyId: numericId,
          },
        },
      });
      if (propertyPayments.length > 0) {
        payments = propertyPayments;
      }
    }

    res.json(payments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving lease payments: ${error.message}` });
  }
};

export const getPropertyPayments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const payments = await prisma.payment.findMany({
      where: {
        lease: {
          propertyId: Number(id),
        },
      },
    });
    res.json(payments);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property payments: ${error.message}` });
  }
};

export const getPropertyLeases = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const leases = await prisma.lease.findMany({
      where: { propertyId: Number(id) },
      include: {
        tenant: true,
        property: true,
      },
    });
    res.json(leases);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving property leases: ${error.message}` });
  }
};

export const getLeaseAgreement = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid lease ID" });
      return;
    }

    await generateTenancyAgreement(numericId, res);
  } catch (error: any) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ message: `Error generating lease agreement: ${error.message}` });
    }
  }
};

export const getLeaseLifecycleHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
      res.status(400).json({ message: "Invalid lease ID" });
      return;
    }

    const lifecycle = await getLeaseLifecycleById(numericId);
    res.json(lifecycle);
  } catch (error: any) {
    res
      .status(error.message?.includes("not found") ? 404 : 500)
      .json({ message: `Error calculating lease lifecycle: ${error.message}` });
  }
};

