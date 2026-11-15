import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbotController';
import { optionalAuthenticateJwt } from '../middleware/auth';

const router = Router();

// Allow both logged-in users (grounded in medical dossier) and visitors
router.use(optionalAuthenticateJwt);

router.post('/ask', ChatbotController.ask);

export default router;
