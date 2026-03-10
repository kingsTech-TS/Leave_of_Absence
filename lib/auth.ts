import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import dbConnect from './mongodb';
import User from './models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_mode';

export async function signToken(payload: any) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export async function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) return null;

  try {
    const decoded = await verifyToken(token) as Record<string, any> | null;
    if (!decoded) return null;

    // The JWT payload contains the full user object (set in loginUser)
    return {
      _id: decoded.id || decoded._id,
      id: decoded.id || decoded._id,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      department: decoded.department,
      faculty: decoded.faculty,
      idNumber: decoded.idNumber,
      staffCategory: decoded.staffCategory ?? null,
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}
