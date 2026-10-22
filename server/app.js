import express from 'express';
import cookieParser from 'cookie-parser';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';

const app = express();
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(async (req, res, next) => { await connectDB(); next(); });

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => {
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again' });
});

export default app;
