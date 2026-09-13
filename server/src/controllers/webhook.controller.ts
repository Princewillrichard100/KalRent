import { Request, Response } from "express";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const handlePaystackWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      res.status(500).json({ message: "PAYSTACK_SECRET_KEY not set" });
      return;
    }

    const signature = req.headers["x-paystack-signature"] as string;
    if (!signature) {
      res.status(401).json({ message: "No signature header provided" });
      return;
    }

    // Validate HMAC SHA512 signature using raw request body
    const rawBody = (req as any).rawBody || JSON.stringify(req.body);
    const hash = crypto
      .createHmac("sha512", paystackSecret)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      res.status(400).json({ message: "Invalid signature" });
      return;
    }

    const event = req.body;

    if (event.event === "charge.success") {
      const data = event.data;
      const reference = data.reference;
      const metadata = data.metadata || {};
      const leaseId = metadata.leaseId ? Number(metadata.leaseId) : null;
      const amountPaid = Number(data.amount) / 100; // Convert kobo to NGN

      if (!leaseId) {
        console.warn("charge.success event missing leaseId in metadata:", reference);
        res.sendStatus(200);
        return;
      }

      await prisma.$transaction(async (tx) => {
        const lease = await tx.lease.findUnique({
          where: { id: leaseId },
        });

        if (!lease) {
          throw new Error(`Lease ${leaseId} not found in webhook processing`);
        }

        const cautionDeposit =
          metadata.cautionDeposit !== undefined
            ? Number(metadata.cautionDeposit)
            : lease.cautionDeposit;

        // 1. Create or update Transaction row
        await tx.transaction.upsert({
          where: { reference },
          update: {
            status: "SUCCESS",
            paidAt: new Date(data.paid_at || Date.now()),
            amount: amountPaid,
          },
          create: {
            leaseId: lease.id,
            amount: amountPaid,
            type: "FULL_RENT",
            status: "SUCCESS",
            reference,
            provider: "PAYSTACK",
            paidAt: new Date(data.paid_at || Date.now()),
          },
        });

        // 2. Create EscrowHold row for caution deposit if not already exists (status: HELD)
        const existingEscrow = await tx.escrowHold.findFirst({
          where: { providerReference: reference },
        });

        if (!existingEscrow) {
          await tx.escrowHold.create({
            data: {
              leaseId: lease.id,
              amount: cautionDeposit,
              status: "HELD",
              providerReference: reference,
            },
          });
        }

        // 3. Mark Lease status as ACTIVE with paidAt, startDate, and endDate
        const paidDate = new Date(data.paid_at || Date.now());
        const startDate = new Date();
        const endDate = new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        );

        await tx.lease.update({
          where: { id: lease.id },
          data: {
            status: "ACTIVE",
            paidAt: paidDate,
            startDate,
            endDate,
          },
        });

        // 4. Update corresponding Application.status = APPROVED
        if (lease.applicationId) {
          await tx.application.update({
            where: { id: lease.applicationId },
            data: { status: "APPROVED" },
          });
        }

        // Connect tenant to property current residences
        await tx.property.update({
          where: { id: lease.propertyId },
          data: {
            tenants: {
              connect: { cognitoId: lease.tenantCognitoId },
            },
          },
        });

        // 5. Create Payment row with status Paid if not already created
        const existingPayment = await tx.payment.findFirst({
          where: { leaseId: lease.id, paymentStatus: "Paid" },
        });

        if (!existingPayment) {
          await tx.payment.create({
            data: {
              amountDue: amountPaid,
              amountPaid,
              dueDate: new Date(),
              paymentDate: paidDate,
              paymentStatus: "Paid",
              leaseId: lease.id,
            },
          });
        }
      });
    }

    res.sendStatus(200);
  } catch (error: any) {
    console.error("Error processing Paystack webhook:", error);
    res.status(500).json({ message: error.message || "Webhook processing error" });
  }
};
