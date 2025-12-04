require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const workflowRoutes = require('./routes/workflows');
const runRoutes = require('./routes/runs');
const { seedDefaultUser } = require('./seed')

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '::'; // bind to IPv6 unspecified to accept IPv6 and IPv4 on most systems
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/workflowforge';
const FRONTEND_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL || null;

// Middleware
app.use(express.json());
// Restrict CORS in non-dev environments using FRONTEND_URL env var
const corsOptions = FRONTEND_URL ? { origin: FRONTEND_URL, methods: ['GET','POST','PUT','PATCH','DELETE'], credentials: true } : {};
app.use(cors(corsOptions));

if(!process.env.JWT_SECRET){
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using insecure default for development. Set JWT_SECRET in production.');
  process.env.JWT_SECRET = 'dev_secret_not_for_prod';
}

// MongoDB Connection
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    // Fire-and-forget seeding of a default admin user (non-blocking)
    try { seedDefaultUser(); } catch (e) { console.error('Seed call error:', e?.message || e) }
  })
  .catch((err) => {
    console.error('✗ MongoDB connection failed:', err.message);
  });

// Health Check Route
app.get('/', (req, res) => {
  res.json({ message: 'workflowforge api is running' });
});

// Auth Routes
app.use('/api/auth', authRoutes);

// Workflow Routes
app.use('/api/workflows', workflowRoutes);

// Run Routes
app.use('/api/runs', runRoutes);

// Start Server
const server = app.listen(PORT, HOST, () => {
  const addr = server.address();
  const hostForLog = addr && addr.address ? addr.address : HOST;
  console.log(`✓ Server running on http://${hostForLog}:${PORT}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err?.message || err);
  console.error(err?.stack || 'no stack');
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
});
