require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./backend/routes/auth');
const workflowRoutes = require('./backend/routes/workflows');
const runRoutes = require('./backend/routes/runs');
const { seedDefaultUser } = require('./backend/seed')

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '::';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/workflowforge';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || null;

app.use(express.json());

const corsOptions = FRONTEND_URL
  ? { origin: FRONTEND_URL, methods: ['GET','POST','PUT','PATCH','DELETE'], credentials: true }
  : { origin: true, credentials: true };
app.use(cors(corsOptions));

// Rate limiting on auth routes
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { error: 'Too many requests, try again later' } });
app.use('/api/auth', authLimiter);

if(!process.env.JWT_SECRET){
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using insecure default for development. Set JWT_SECRET in production.');
  process.env.JWT_SECRET = 'dev_secret_not_for_prod';
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    seedDefaultUser().catch(e => console.error('Seed error:', e?.message || e));
  })
  .catch((err) => {
    console.error('✗ MongoDB connection failed:', err.message);
  });

app.get('/', (req, res) => {
  res.json({ message: 'workflowforge api is running' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.floor(process.uptime()) });
});

app.use('/api/auth', authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/runs', runRoutes);

const server = app.listen(PORT, HOST, () => {
  const addr = server.address();
  const hostForLog = addr && addr.address ? addr.address : HOST;
  console.log(`✓ Server running on http://${hostForLog}:${PORT}`);

  // Keep-alive: ping ourselves every 14 min to prevent Render free tier cold starts
  if (process.env.RENDER_EXTERNAL_URL) {
    const url = `${process.env.RENDER_EXTERNAL_URL}/api/health`;
    setInterval(() => {
      fetch(url).catch(() => {});
    }, 14 * 60 * 1000);
    console.log(`✓ Keep-alive enabled → ${url} every 14m`);
  }
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err?.message || err);
  console.error(err?.stack || 'no stack');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
