import { Lease, EscrowHold, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface LeaseLifecycle {
  leaseId: number;
  totalDays: number;
  daysElapsed: number;
  daysRemaining: number;
  percentCompleted: number;
  statusLabel: string;
  escrowStatus: string;
  cautionDeposit: number;
  isExpiringSoon: boolean;
  isEligibleForMoveOutInspection: boolean;
  startDate: string;
  endDate: string;
  paidAt?: string | null;
}

export const calculateLeaseLifecycle = (
  lease: Lease & { escrowHolds?: EscrowHold[] }
): LeaseLifecycle => {
  const start = new Date(lease.startDate).getTime();
  const end = new Date(lease.endDate).getTime();
  const now = Date.now();

  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.max(1, Math.round((end - start) / msPerDay));
  const rawElapsed = Math.round((now - start) / msPerDay);
  const daysElapsed = Math.min(Math.max(0, rawElapsed), totalDays);
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const percentCompleted = Math.min(
    100,
    Math.max(0, Math.round((daysElapsed / totalDays) * 100))
  );

  let statusLabel = "Active Tenancy";
  if (lease.status !== "ACTIVE") {
    if (lease.status === "PENDING_PAYMENT") {
      statusLabel = "Awaiting Payment";
    } else if (lease.status === "DRAFT") {
      statusLabel = "Draft";
    } else if (lease.status === "TERMINATED") {
      statusLabel = "Terminated";
    } else if (lease.status === "EXPIRED") {
      statusLabel = "Expired";
    } else {
      statusLabel = String(lease.status);
    }
  } else if (daysRemaining <= 0) {
    statusLabel = "Expired";
  } else if (daysRemaining <= 30) {
    statusLabel = "Expiring Soon";
  } else {
    statusLabel = "Active Tenancy";
  }

  // Check escrow hold status
  const latestEscrow =
    lease.escrowHolds && lease.escrowHolds.length > 0
      ? lease.escrowHolds[lease.escrowHolds.length - 1]
      : null;
  const escrowStatus = latestEscrow ? latestEscrow.status : "HELD";

  const isExpiringSoon =
    lease.status === "ACTIVE" && daysRemaining <= 30 && daysRemaining > 0;
  const isEligibleForMoveOutInspection =
    lease.status === "ACTIVE" && daysRemaining <= 30;

  return {
    leaseId: lease.id,
    totalDays,
    daysElapsed,
    daysRemaining,
    percentCompleted,
    statusLabel,
    escrowStatus,
    cautionDeposit: lease.cautionDeposit,
    isExpiringSoon,
    isEligibleForMoveOutInspection,
    startDate: lease.startDate.toISOString(),
    endDate: lease.endDate.toISOString(),
    paidAt: lease.paidAt ? lease.paidAt.toISOString() : null,
  };
};

export const getLeaseLifecycleById = async (
  leaseId: number
): Promise<LeaseLifecycle> => {
  const lease = await prisma.lease.findUnique({
    where: { id: leaseId },
    include: {
      escrowHolds: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!lease) {
    throw new Error(`Lease #${leaseId} not found`);
  }

  return calculateLeaseLifecycle(lease);
};
