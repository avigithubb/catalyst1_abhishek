import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/oauth/google', AuthController.googleOAuth);
router.get('/me', authenticateJwt, AuthController.getProfile);

export default router;
