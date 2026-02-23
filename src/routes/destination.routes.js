import { Router } from 'express';
import {
  getAllDestinations,
  getDestinationAttractions,
  getDestinationBySlug,
  getDestinationHotels,
  getDestinationRestaurants,
} from '../controllers/destination.controllers.js';

const router = Router();

router.get('/', getAllDestinations);
router.get('/:slug', getDestinationBySlug);
router.get('/:slug/hotels', getDestinationHotels);
router.get('/:slug/restaurants', getDestinationRestaurants);
router.get('/:slug/attractions', getDestinationAttractions);

export default router;