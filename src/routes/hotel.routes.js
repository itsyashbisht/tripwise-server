import { Router } from 'express';
import { getAllHotels, getHotelById } from '../controllers/hotel.controllers.js';

const router = Router();

router.get('/', getAllHotels);
router.get('/:id', getHotelById);

export default router;