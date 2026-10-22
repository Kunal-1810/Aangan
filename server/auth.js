import jwt from 'jsonwebtoken';
import { User } from './models.js';

// JWT in an httpOnly cookie works on serverless (no in-memory sessions needed).
export function setAuthCookie(res, user) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'Please sign in' });
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select('-passwordHash');
    if (!user) return res.status(401).json({ error: 'Please sign in' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Session expired. Please sign in again' });
  }
}

export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ error: 'You do not have access to this action' });
