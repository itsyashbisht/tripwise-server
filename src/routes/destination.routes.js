import { Router } from "express";
import {
  getDestination,
  getDestinationAttractions,
  getDestinationHotels,
  getDestinationRestaurants,
  listDestinations,
} from "../controllers/destination.controllers.js";

const router = Router();

router.get("/", listDestinations);
router.get("/:slug", getDestination);
router.get("/:slug/hotels", getDestinationHotels);
router.get("/:slug/restaurants", getDestinationRestaurants);
router.get("/:slug/attractions", getDestinationAttractions);

export default router;
