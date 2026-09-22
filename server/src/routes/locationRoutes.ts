import express from "express";
import {
  autocompleteLocations,
  getLocationDetails,
} from "../controllers/locationController";

const router = express.Router();

router.get("/autocomplete", autocompleteLocations);
router.get("/details", getLocationDetails);

export default router;
