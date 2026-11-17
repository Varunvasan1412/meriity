import { z } from 'zod';
import { pool } from '../db/pool.js';

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(190),
  phone: z.string().trim().max(40).optional(),
  company: z.string().trim().max(160).optional(),
  message: z.string().trim().min(10).max(5000),
});

export async function createInquiry(req, res) {
  const { name, email, phone = null, company = null, message } = req.body;
  const [result] = await pool.execute(
    'INSERT INTO contact_inquiries (name, email, phone, company, message) VALUES (:name, :email, :phone, :company, :message)',
    { name, email, phone, company, message },
  );
  res.status(201).json({ id: result.insertId, message: 'Thanks! We will get back to you soon.' });
}
