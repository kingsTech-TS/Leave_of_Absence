'use server';

import dbConnect from '../mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../auth';
import { cookies } from 'next/headers';
import { LoginResponse } from '@/types';

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'STAFF' | 'OFFICIAL';
  idNumber: string;
  department: string;
  faculty: string;
  officialLevel?: 'HOD' | 'DEAN' | 'VC' | null;
  staffCategory?: 'ACADEMIC' | 'NON_ACADEMIC' | null;
}): Promise<LoginResponse> {
  try {
    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email: data.email.toLowerCase().trim() },
        { idNumber: data.idNumber }
      ]
    });

    if (existingUser) {
      return { success: false, message: 'User with this email or ID number already exists.' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    // Create user
    const user = await User.create({
      ...data,
      email: data.email.toLowerCase().trim(),
      password: hashedPassword
    });

    // Automatically log in after registration
    return await loginUser({ email: data.email, password: data.password });
    
  } catch (error: any) {
    console.error('[registerUser] Error:', error);
    return { success: false, message: error.message || 'An error occurred during registration.' };
  }
}

/**
 * Authenticates a user against the local MongoDB database.
 * On success, sets an `auth_token` cookie with a signed JWT.
 */
export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<LoginResponse> {
  try {
    await dbConnect();

    const user = await User.findOne({ email: data.email.toLowerCase().trim() });

    if (!user) {
      return { success: false, message: 'Invalid email or password.' };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return { success: false, message: 'Invalid email or password.' };
    }

    // Build the JWT payload (mirrors getCoreUser shape)
    const payload = {
      id: user._id.toString(),
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      faculty: user.faculty,
      idNumber: user.idNumber,
      officialLevel: user.officialLevel ?? null,
      staffCategory: user.staffCategory ?? null,
    };

    const token = await signToken(payload);

    // Set httpOnly cookie — same name used everywhere: auth_token
    const cookieStore = await cookies();
    cookieStore.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
      sameSite: 'lax',
    });

    return { success: true, role: user.role };
  } catch (error: any) {
    console.error('[loginUser] Error:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token'); // Primary cookie set by the auth callback
  cookieStore.delete('token');       // Legacy fallback cleanup
  return { success: true };
}
