import { Router } from 'express';
import { generateItinerary, getPackagePrices } from '../controllers/generate.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import rateLimit from 'express-rate-limit';

// Tight rate limit — each AI call costs money
const aiLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: 'Too many generation requests. Please wait a minute and try again.' },
});

const router = Router();

// POST /api/generate  — full AI trip generation
router.post('/', verifyJWT, generateItinerary);

// GET  /api/generate/packages — instant price estimate, no AI call
router.get('/packages', getPackagePrices);

export default router;