import { Request, Response } from "express";
import {
  initializeLeasePayment,
  verifyLeasePayment,
} from "../services/payment.service";

export const initializePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { leaseId, callbackUrl } = req.body;
    const tenantCognitoId = req.user?.id || req.body.tenantCognitoId;

    if (!leaseId) {
      res.status(400).json({ message: "leaseId is required" });
      return;
    }

    if (!tenantCognitoId) {
      res.status(401).json({ message: "Tenant authentication required" });
      return;
    }

    const result = await initializeLeasePayment({
      leaseId: Number(leaseId),
      tenantCognitoId,
      callbackUrl,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error initializing payment:", error);
    res
      .status(error.message.includes("not found") ? 404 : 400)
      .json({ message: error.message || "Failed to initialize payment" });
  }
};

export const verifyPayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const reference = (req.params.reference ||
      req.query.reference ||
      req.body.reference) as string;

    if (!reference) {
      res.status(400).json({ message: "Transaction reference is required" });
      return;
    }

    const result = await verifyLeasePayment(reference);
    res.status(200).json(result);
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    res
      .status(400)
      .json({ message: error.message || "Failed to verify payment" });
  }
};
