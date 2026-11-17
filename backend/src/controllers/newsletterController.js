import { z } from 'zod';
import { pool } from '../db/pool.js';

export const subscribeSchema = z.object({ email: z.string().trim().email().max(190) });

export async function subscribe(req, res) {
  await pool.execute('INSERT INTO newsletter_subscribers (email) VALUES (:email)', req.body);
  res.status(201).json({ message: 'Subscribed' });
}
