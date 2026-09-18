const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  // Check token in cookie or Authorization header
  let token = req.cookies?.token || req.query.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized access. Please log in to view our private world.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'our_little_world_super_secret_jwt_key_2026_xoxo');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
}

module.exports = authMiddleware;
