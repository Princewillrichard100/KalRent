import express from "express";
import {
  getProperties,
  getProperty,
  createProperty,
  getPropertyPhoto,
  getNearbyProperties,
} from "../controllers/propertyControllers";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

import {
  getPropertyLeases,
  getPropertyPayments,
} from "../controllers/leaseControllers";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/photos/*", getPropertyPhoto);
router.get("/nearby", getNearbyProperties);
router.get("/", getProperties);
router.get("/:id", getProperty);
router.get("/:id/leases", authMiddleware(["manager", "tenant"]), getPropertyLeases);
router.get("/:id/payments", authMiddleware(["manager", "tenant"]), getPropertyPayments);
router.post(
  "/",
  authMiddleware(["manager"]),
  upload.array("photos"),
  createProperty
);

export default router;
