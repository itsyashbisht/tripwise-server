import { Router } from "express";
import {
  generateItinerary,
  getPackagePrices,
} from "../controllers/generate.controllers.js";
import rateLimit from "express-rate-limit";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Tight rate limit — each AI call costs money
const aiLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    error: "Too many generation requests. Please wait a minute and try again.",
  },
});

const router = Router();

router.post("/", aiLimit, verifyJWT, generateItinerary);
router.get("/packages", getPackagePrices);

export default router;
