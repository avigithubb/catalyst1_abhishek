import { Router } from 'express';
import { MedicationController } from '../controllers/medicationController';
import { authenticateJwt } from '../middleware/auth';

const router = Router();

// Enforce JWT authentication on all medication routes
router.use(authenticateJwt);

router.get('/daily', MedicationController.getDailyChecklist);
router.post('/:id/toggle', MedicationController.toggleStatus);
router.post('/', MedicationController.create);
router.post('/cron-check-adherence', MedicationController.checkAdherenceCron);

export default router;
