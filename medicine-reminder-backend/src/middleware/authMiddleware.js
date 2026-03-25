import jwt from 'jsonwebtoken';
import env from '../config/dotenv.js';
import User from '../models/User.js';

export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, token missing' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password').lean();
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
    };

    return next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
}
