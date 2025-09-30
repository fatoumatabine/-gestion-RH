import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.config.js';

export const auth = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ error: 'Please authenticate' });
  }
};