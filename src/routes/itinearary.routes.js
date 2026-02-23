import { Router } from 'express';
import {
  deleteItinerary,
  getByShareToken,
  getItineraryById,
  getMyItineraries,
  getSavedItineraries,
  saveItinerary,
  shareItinerary,
  unsaveItinerary,
} from '../controllers/itinearary.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// ── Public routes (no auth needed) ──────────────────────────
router.get('/shared/:token', getByShareToken);

// ── Auth-required routes ─────────────────────────────────────
router.get('/', verifyJWT, getMyItineraries);
router.get('/saved', verifyJWT, getSavedItineraries);
router.get('/:id', verifyJWT, getItineraryById);
router.delete('/:id', verifyJWT, deleteItinerary);
router.post('/:id/save', verifyJWT, saveItinerary);
router.delete('/:id/save', verifyJWT, unsaveItinerary);
router.post('/:id/share', verifyJWT, shareItinerary);

export default router;