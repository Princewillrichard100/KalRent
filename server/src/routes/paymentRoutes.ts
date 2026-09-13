import { Router } from "express";
import {
  initializePayment,
  verifyPayment,
} from "../controllers/paymentController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.post("/initialize", authMiddleware(["tenant"]), initializePayment);
router.get("/verify/:reference", authMiddleware(["tenant", "manager"]), verifyPayment);
router.post("/verify", authMiddleware(["tenant", "manager"]), verifyPayment);

export default router;
