import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listApplications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId, userType } = req.query;

    let whereClause = {};

    if (userId && userType) {
      if (userType === "tenant") {
        whereClause = { tenantCognitoId: String(userId) };
      } else if (userType === "manager") {
        whereClause = {
          property: {
            managerCognitoId: String(userId),
          },
        };
      }
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        property: {
          include: {
            location: true,
            manager: true,
          },
        },
        tenant: true,
      },
    });

    function calculateNextPaymentDate(startDate: Date): Date {
      const today = new Date();
      const nextPaymentDate = new Date(startDate);
      while (nextPaymentDate <= today) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
      }
      return nextPaymentDate;
    }

    const formattedApplications = await Promise.all(
      applications.map(async (app) => {
        const lease = await prisma.lease.findFirst({
          where: {
            tenant: {
              cognitoId: app.tenantCognitoId,
            },
            propertyId: app.propertyId,
          },
          orderBy: { startDate: "desc" },
        });

        return {
          ...app,
          property: {
            ...app.property,
            address: app.property.location.address,
          },
          manager: app.property.manager,
          lease: lease
            ? {
                ...lease,
                nextPaymentDate: calculateNextPaymentDate(lease.startDate),
              }
            : null,
        };
      })
    );

    res.json(formattedApplications);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving applications: ${error.message}` });
  }
};

export const createApplication = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      applicationDate,
      status,
      propertyId,
      tenantCognitoId,
      name,
      email,
      phoneNumber,
      message,
    } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      res.status(404).json({ message: "Property not found" });
      return;
    }

    const normalizedStatus = status
      ? status.toUpperCase() === "PENDING"
        ? "PENDING"
        : status.toUpperCase() === "APPROVED"
        ? "APPROVED"
        : status.toUpperCase() === "REJECTED" ||
          status.toUpperCase() === "DENIED"
        ? "REJECTED"
        : status.toUpperCase() === "LEASE_PENDING"
        ? "LEASE_PENDING"
        : "PENDING"
      : "PENDING";

    const newApplication = await prisma.application.create({
      data: {
        applicationDate: applicationDate
          ? new Date(applicationDate)
          : new Date(),
        status: normalizedStatus as any,
        name,
        email,
        phoneNumber,
        message,
        property: {
          connect: { id: propertyId },
        },
        tenant: {
          connect: { cognitoId: tenantCognitoId },
        },
      },
      include: {
        property: true,
        tenant: true,
      },
    });

    res.status(201).json(newApplication);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error creating application: ${error.message}` });
  }
};

export const updateApplicationStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log("status:", status);

    const application = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        property: true,
        tenant: true,
      },
    });

    if (!application) {
      res.status(404).json({ message: "Application not found." });
      return;
    }

    const normalizedStatus = String(status).toUpperCase();

    if (normalizedStatus === "APPROVED") {
      await prisma.$transaction(async (tx) => {
        const existingLease = await tx.lease.findUnique({
          where: { applicationId: Number(id) },
        });

        if (!existingLease) {
          await tx.lease.create({
            data: {
              startDate: new Date(),
              endDate: new Date(
                new Date().setFullYear(new Date().getFullYear() + 1)
              ),
              annualRent: application.property.annualRent,
              cautionDeposit: application.property.cautionDeposit,
              agentFee: application.property.agentFee,
              platformFee: application.property.platformFee,
              propertyId: application.propertyId,
              tenantCognitoId: application.tenantCognitoId,
              applicationId: application.id,
              status: "PENDING_PAYMENT",
            },
          });
        }

        // Update the property to connect the tenant
        await tx.property.update({
          where: { id: application.propertyId },
          data: {
            tenants: {
              connect: { cognitoId: application.tenantCognitoId },
            },
          },
        });

        await tx.application.update({
          where: { id: Number(id) },
          data: { status: "APPROVED" },
        });
      });
    } else {
      const validStatuses = ["PENDING", "APPROVED", "REJECTED", "LEASE_PENDING"];
      const targetStatus = validStatuses.includes(normalizedStatus)
        ? (normalizedStatus as any)
        : normalizedStatus === "DENIED"
        ? "REJECTED"
        : "PENDING";

      await prisma.application.update({
        where: { id: Number(id) },
        data: { status: targetStatus },
      });
    }

    const updatedApplication = await prisma.application.findUnique({
      where: { id: Number(id) },
      include: {
        property: true,
        tenant: true,
        lease: true,
      },
    });

    res.json(updatedApplication);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: `Error updating application status: ${error.message}` });
  }
};
