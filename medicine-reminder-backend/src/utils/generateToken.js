import jwt from 'jsonwebtoken';
import env from '../config/dotenv.js';

export default function generateToken(userId) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}
