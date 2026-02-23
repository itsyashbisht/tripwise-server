import { Router } from 'express';
import { login, logout, me, register } from '../controllers/auth.controllers.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyJWT, me);

export default router;