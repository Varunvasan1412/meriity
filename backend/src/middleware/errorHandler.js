import { env } from '../config/env.js';

export const notFound = (req, res) => res.status(404).json({ message: 'Not found' });

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Already exists' });
  console.error(err);
  res.status(err.status ?? 500).json({
    message: env.nodeEnv === 'production' ? 'Server error' : err.message,
  });
};
