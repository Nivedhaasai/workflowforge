const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Read Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization header is missing' });
    }

    // Check format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({ error: 'Invalid authorization header format' });
    }

    const token = parts[1];

    // Verify token with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach decoded payload to req.user
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = authMiddleware;
