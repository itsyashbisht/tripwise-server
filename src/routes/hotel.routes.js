import { Router } from "express";
import { getHotel, listHotels } from "../controllers/hotel.controllers.js";

const router = Router();

router.get("/", listHotels);
router.get("/:id", getHotel);

export default router;
