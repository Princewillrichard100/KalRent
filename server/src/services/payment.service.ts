import { PrismaClient } from "@prisma/client";
import axios from "axios";

const prisma = new PrismaClient();

interface InitializePaymentParams {
  leaseId: number;
  tenantCognitoId: string;
  callbackUrl?: string;
}

export interface PaymentInitializationResult {
  authorization_url: string;
  access_code: string;
  reference: string;
  totalAmount: number;
  breakdown: {
    annualRent: number;
    agentFee: number;
    cautionDeposit: number;
    platformFee: number;
  };
}

export const initializeLeasePayment = async ({
  leaseId,
  tenantCognitoId,
  callbackUrl,
}: InitializePaymentParams): Promise<PaymentInitializationResult> => {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      tenant: true,
      property: true,
      application: true,
    },
  });

  if (!lease) {
    throw new Error(`Lease with ID ${leaseId} not found`);
  }

  if (lease.tenantCognitoId !== tenantCognitoId) {
    throw new Error("Unauthorized: Lease does not belong to this tenant");
  }

  if (lease.status === "ACTIVE") {
    throw new Error("Lease has already been paid and activated.");
  }

  // Idempotency guard: check if any transaction for this lease has status SUCCESS
  const successfulTx = await prisma.transaction.findFirst({
    where: {
      leaseId: lease.id,
      status: "SUCCESS",
    },
  });

  if (successfulTx) {
    await prisma.lease.update({
      where: { id: lease.id },
      data: {
        status: "ACTIVE",
        paidAt: lease.paidAt || successfulTx.paidAt || new Date(),
      },
    });
    throw new Error("Lease has already been paid and activated.");
  }

  // Transition to PENDING_PAYMENT if currently DRAFT
  if (lease.status === "DRAFT") {
    await prisma.lease.update({
      where: { id: lease.id },
      data: { status: "PENDING_PAYMENT" },
    });
  }

  const totalAmount =
    lease.annualRent + lease.agentFee + lease.cautionDeposit + lease.platformFee;
  const amountInKobo = Math.round(totalAmount * 100);
  const reference = `kalrent_${lease.id}_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 7)}`;

  const breakdown = {
    annualRent: lease.annualRent,
    agentFee: lease.agentFee,
    cautionDeposit: lease.cautionDeposit,
    platformFee: lease.platformFee,
  };

  const virtualHold = {
    cautionDepositEscrow: lease.cautionDeposit,
    platformFeeRetained: lease.platformFee,
    disbursableToLandlordAgent: lease.annualRent + lease.agentFee,
  };

  // Record transaction in INITIALIZED state
  await prisma.transaction.create({
    data: {
      leaseId: lease.id,
      amount: totalAmount,
      type: "FULL_RENT",
      status: "INITIALIZED",
      reference,
      provider: "PAYSTACK",
    },
  });

  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  const paystackResponse = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: lease.tenant.email,
      amount: amountInKobo,
      reference,
      callback_url:
        callbackUrl ||
        `${process.env.CLIENT_URL || "http://localhost:3000"}/tenants/applications`,
      metadata: {
        leaseId: lease.id,
        tenantCognitoId: lease.tenantCognitoId,
        propertyId: lease.propertyId,
        cautionDeposit: lease.cautionDeposit,
        breakdown,
        virtualHold,
        custom_fields: [
          {
            display_name: "Property",
            variable_name: "property_name",
            value: lease.property.name,
          },
          {
            display_name: "Caution Deposit (Escrow)",
            variable_name: "caution_deposit",
            value: `₦${lease.cautionDeposit.toLocaleString()}`,
          },
          {
            display_name: "Annual Rent",
            variable_name: "annual_rent",
            value: `₦${lease.annualRent.toLocaleString()}`,
          },
        ],
      },
    },
    {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
    }
  );

  const { authorization_url, access_code } = paystackResponse.data.data;

  return {
    authorization_url,
    access_code,
    reference,
    totalAmount,
    breakdown,
  };
};

export const verifyLeasePayment = async (
  reference: string
): Promise<{ success: boolean; leaseId: number; message: string }> => {
  const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
  if (!paystackSecret) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured");
  }

  // 1. Verify with Paystack API
  const paystackRes = await axios.get(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    }
  );

  const data = paystackRes.data?.data;
  if (!data || data.status !== "success") {
    throw new Error(
      `Payment verification failed with status: ${data?.status || "unknown"}`
    );
  }

  const metadata = data.metadata || {};
  const leaseId = metadata.leaseId ? Number(metadata.leaseId) : null;
  const amountPaid = Number(data.amount) / 100;

  if (!leaseId) {
    throw new Error("Transaction verification missing lease ID in metadata");
  }

  // 2. Wrap updates in atomic Prisma $transaction
  await prisma.$transaction(async (tx) => {
    const lease = await tx.lease.findUnique({
      where: { id: leaseId },
    });

    if (!lease) {
      throw new Error(`Lease #${leaseId} not found during verification`);
    }

    const cautionDeposit =
      metadata.cautionDeposit !== undefined
        ? Number(metadata.cautionDeposit)
        : lease.cautionDeposit;

    const paidDate = new Date(data.paid_at || Date.now());
    const startDate = new Date();
    const endDate = new Date(
      new Date().setFullYear(new Date().getFullYear() + 1)
    );

    // Update or create Transaction to SUCCESS
    await tx.transaction.upsert({
      where: { reference },
      update: {
        status: "SUCCESS",
        paidAt: paidDate,
        amount: amountPaid,
      },
      create: {
        leaseId: lease.id,
        amount: amountPaid,
        type: "FULL_RENT",
        status: "SUCCESS",
        reference,
        provider: "PAYSTACK",
        paidAt: paidDate,
      },
    });

    // Create EscrowHold if not already created
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

    // Set Lease.status = ACTIVE, paidAt, startDate, endDate
    await tx.lease.update({
      where: { id: lease.id },
      data: {
        status: "ACTIVE",
        paidAt: paidDate,
        startDate,
        endDate,
      },
    });

    // Update corresponding Application.status = APPROVED
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

    // Record Payment if not already recorded
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

  return {
    success: true,
    leaseId,
    message: "Lease payment successfully verified and activated",
  };
};
