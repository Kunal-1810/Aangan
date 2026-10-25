import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './db.js';
import authRoutes from './routes/auth.js';
import propertyRoutes from './routes/properties.js';

const app = express();

// Needed so secure cookies work behind Vercel's proxy
app.set('trust proxy', 1);

// CORS: allow local dev + your deployed frontend (set CLIENT_URL in Vercel)
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL, // e.g. https://your-frontend.vercel.app (no trailing slash)
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (curl, Postman, same-origin)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// Health check: placed BEFORE the DB middleware so it shows the server is alive
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Connect to MongoDB before any route that needs it
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Central error handler
app.use((err, req, res, next) => {
  if (err.name === 'CastError') return res.status(400).json({ error: 'Invalid id' });
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  if (err.message === 'Not allowed by CORS') return res.status(403).json({ error: err.message });
  console.error(err); // shows the real cause in Vercel Runtime Logs
  res.status(500).json({ error: 'Something went wrong. Please try again' });
});

export default app;