import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbotController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// Apply JWT authentication so the chatbot knows which patient's context to inspect
router.use(authenticateJwt);

router.post('/ask', ChatbotController.ask);

export default router;
