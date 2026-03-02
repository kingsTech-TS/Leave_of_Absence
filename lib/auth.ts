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

  try {
    // 1. Validate against the external Core Platform first as it's the source of truth
    const CORE_URL = process.env.CORE_API_URL || "https://eksucore.vercel.app";
    const coreProfileUrl = `${CORE_URL}/api/users/me`;
    const response = await fetch(coreProfileUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 60 } // cache for 1 minute to avoid excessive pings
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        ...userData,
        // Ensure _id and role are present for compatibility with local code
        _id: userData._id || userData.id,
        role: userData.role
      };
    }

    // 2. Fallback to local database if external validation fails
    // This supports local development and local-only users (like seeded admins)
    const decoded = await verifyToken(token) as { userId: string } | null;
    if (!decoded || !decoded.userId) return null;

    await dbConnect();
    const user = await User.findById(decoded.userId).lean().exec();

    if (!user) return null;

    return {
      ...user,
      _id: user._id.toString(),
    };
  } catch (error) {
    console.error("Session verification error:", error);
    return null;
  }
}
