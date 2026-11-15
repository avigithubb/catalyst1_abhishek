import { Router } from 'express';
import { query } from '../db/connection';
import { authenticateJwt, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticateJwt);

/**
 * Toggle Exercise completion state
 */
router.post('/:id/toggle', async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  try {
    const updateRes = await query(
      `UPDATE daily_exercises 
       SET is_completed = $1 
       WHERE id = $2 AND patient_id = $3
       RETURNING id, patient_id AS "patientId", title, duration_minutes AS "durationMinutes", 
                 category, instructions, scheduled_time AS "scheduledTime", is_completed AS completed`,
      [completed, id, req.user?.patientProfileId]
    );

    if (updateRes.rowCount === 0) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    return res.json(updateRes.rows[0]);
  } catch (error) {
    console.error('Error toggling exercise:', error);
    return res.status(500).json({ message: 'Failed to update exercise routine' });
  }
});

export default router;
