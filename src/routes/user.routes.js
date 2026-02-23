import { Router } from 'express';
import {
  changePassword,
  getProfile,
  getSavedPlans,
  removeSavedPlan,
  updateProfile,
} from '../controllers/user.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All user routes require auth
router.use(verifyJWT);

router.get('/getProfile', getProfile);
router.patch('/', updateProfile);
router.patch('/password', changePassword);
router.get('/saved', getSavedPlans);
router.delete('/saved/:itineraryId', removeSavedPlan);

export default router;