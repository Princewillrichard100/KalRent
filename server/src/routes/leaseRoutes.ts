import express from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getLeaseAgreement,
  getLeaseLifecycleHandler,
  getLeasePayments,
  getLeases,
} from "../controllers/leaseControllers";

const router = express.Router();

router.get("/", authMiddleware(["manager", "tenant"]), getLeases);
router.get(
  "/:id/payments",
  authMiddleware(["manager", "tenant"]),
  getLeasePayments
);
router.get(
  "/:id/agreement",
  authMiddleware(["manager", "tenant"]),
  getLeaseAgreement
);
router.get(
  "/:id/lifecycle",
  authMiddleware(["manager", "tenant"]),
  getLeaseLifecycleHandler
);

export default router;
