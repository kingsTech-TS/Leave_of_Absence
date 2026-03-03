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
    
    // Add a timeout to the fetch to prevent hanging for 10s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(coreProfileUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store', // Always fresh "at the moment"
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        // Handle both direct objects and { user: ... } nesting
        const userData = data.user || data;
        
        return {
          ...userData,
          _id: userData._id || userData.id,
          idNumber: userData.idNumber || userData.registrationNumber || userData.matricNo,
          role: userData.role,
          name: userData.name,
          email: userData.email,
          department: userData.department,
          faculty: userData.faculty,
          staffCategory: userData.staffCategory
        };
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      console.warn("External session validation failed or timed out.");
    }

    // 2. Fallback to local database
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
