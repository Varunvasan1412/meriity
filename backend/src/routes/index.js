import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { validate } from '../middleware/validate.js';
import { contactSchema, createInquiry } from '../controllers/contactController.js';
import { subscribeSchema, subscribe } from '../controllers/newsletterController.js';

const router = Router();
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20 });

router.get('/health', async (req, res) => {
  let db = 'up';
  try { await pool.query('SELECT 1'); } catch { db = 'down'; }
  res.json({ status: 'ok', db });
});

router.post('/contact', formLimiter, validate(contactSchema), createInquiry);
router.post('/newsletter', formLimiter, validate(subscribeSchema), subscribe);

// Future: router.use('/admin', requireAuth, adminRoutes);

export default router;
