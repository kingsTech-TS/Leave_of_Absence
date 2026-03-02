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
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const decoded = await verifyToken(token) as { userId: string } | null;

  if (!decoded || !decoded.userId) return null;

  await dbConnect();
  
  // Use lean to avoid returning full mongoose document that might contain un-serializable properties
  // Also serialize _id to string manually if needed, or select fields and return structured response
  const user = await User.findById(decoded.userId).lean().exec();
  
  if (!user) return null;

  return {
    ...user,
    _id: user._id.toString(),
  };
}
