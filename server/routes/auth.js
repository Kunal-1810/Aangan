import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models.js';
import { setAuthCookie, requireAuth } from '../auth.js';

const r = Router();
const publicUser = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });

r.post('/register', async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  if (!name || !email || password.length < 6) {
    return res.status(400).json({ error: 'Name, email and a password of at least 6 characters are required' });
  }
  if (await User.findOne({ email })) return res.status(409).json({ error: 'This email is already registered' });
  // Admins are created manually in the database, never through sign-up.
  const role = req.body.role === 'owner' ? 'owner' : 'user';
  const user = await User.create({ name, email, role, passwordHash: await bcrypt.hash(password, 10) });
  setAuthCookie(res, user);
  res.status(201).json(publicUser(user));
});

r.post('/login', async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase().trim() });
  const ok = user && (await bcrypt.compare(String(req.body.password || ''), user.passwordHash));
  if (!ok) return res.status(401).json({ error: 'Invalid email or password' });
  setAuthCookie(res, user);
  res.json(publicUser(user));
});

r.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

r.get('/me', requireAuth, (req, res) => res.json(publicUser(req.user)));

export default r;
