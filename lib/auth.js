// lib/auth.js
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'fallback-secret-key';
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const authenticateUser = async (request) => {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (!token) {
      return { error: 'No token provided' };
    }

    // Validate token format
    if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
      return { error: 'Invalid token format' };
    }

    const decoded = verifyToken(token);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        first_name: true,
        last_name: true,
        avatar_url: true,
        is_verified: true,
        total_points: true,
        current_streak: true,
        longest_streak: true,
        sessions: true,
        push_notification: true,
        dark_mode: true,
        wellness_reminders: true,
        weekly_summary: true,
        created_at: true,
        updated_at: true
      }
    });

    if (!user) {
      return { error: 'User not found' };
    }

    return { user };
    
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.message === 'Invalid token') {
      return { error: 'Invalid token' };
    }
    return { error: 'Authentication failed' };
  }
};
