const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Helper function to generate JWT token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    email: user.email,
    name: user.name,
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password_hash,
    });

    await newUser.save();

    const token = generateToken(newUser);

    return res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    try {
      const fs = require('fs');
      fs.appendFileSync('server-errors.log', `REGISTER ERROR: ${new Date().toISOString()}\n${error.stack}\n\n`);
    } catch (e) {
      console.error('Failed to write server error log:', e.message);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    try {
      const fs = require('fs');
      fs.appendFileSync('server-errors.log', `LOGIN ERROR: ${new Date().toISOString()}\n${error.stack}\n\n`);
    } catch (e) {
      console.error('Failed to write server error log:', e.message);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me (protected)
const authMiddleware = require('../middleware/auth');
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // req.user is set by auth middleware
    const { id, email, name } = req.user || {};
    return res.status(200).json({ id, email, name });
  } catch (err) {
    console.error('Me route error:', err.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
