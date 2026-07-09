import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Use this on routes that should work for BOTH logged-in and logged-out users
// (e.g. viewing a profile) — unlike `protect`, it never blocks the request.
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    req.user = null; // invalid/expired token — treat as logged-out, don't error
  }

  next();
};

export default optionalAuth;