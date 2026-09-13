import { Router } from "express";
import { handlePaystackWebhook } from "../controllers/webhook.controller";

const router = Router();

// Paystack webhook endpoint
router.post("/paystack", handlePaystackWebhook);

export default router;
