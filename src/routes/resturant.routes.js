// routes/restaurantRoutes.js
import { Router }                               from 'express';
import { getAllRestaurants, getRestaurantById }  from '../controllers/resturant.controllers.js';

const router = Router();

router.get('/',    getAllRestaurants);
router.get('/:id', getRestaurantById);

export default router;