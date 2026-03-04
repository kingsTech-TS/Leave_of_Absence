'use server';

import dbConnect from '../mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../auth';
import { cookies } from 'next/headers';
import { LoginResponse } from '@/types';

/**
 * DEPRECATED: Local authentication is no longer managed here.
 * Use the Core Platform auth via /api/auth/callback and lib/core-user.ts
 */
/*
export async function loginUser(data: any): Promise<LoginResponse> {
  // ... local login logic removed ...
}
*/

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  cookieStore.delete('auth_token'); // Cleanup legacy name if present
  return { success: true };
}
