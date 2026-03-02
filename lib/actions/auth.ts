'use server';

import dbConnect from '../mongodb';
import User from '../models/User';
import bcrypt from 'bcryptjs';
import { signToken } from '../auth';
import { cookies } from 'next/headers';
import { LoginResponse } from '@/types';

export async function loginUser(data: any): Promise<LoginResponse> {
  try {
    await dbConnect();
    const { email, password, role } = data;

    const user = await User.findOne({ email, role });

    if (!user) {
      if (email === 'student@uni.edu' || email === 'staff@uni.edu' || email === 'admin@uni.edu') {
        // Auto-seed dummy user for easy testing
        const hashedPassword = await bcrypt.hash('password123', 10);
        const newUserData = {
          email,
          password: hashedPassword,
          name: role === 'STUDENT' ? 'John Doe' : (role === 'ADMIN' ? 'Admin Super' : 'Dr. Jane Smith'),
          idNumber: role === 'STUDENT' ? 'STU12345' : (role === 'ADMIN' ? 'ADM12345' : 'STAFF12345'),
          department: 'Computer Science',
          faculty: 'Science',
          role,
          staffCategory: role === 'STAFF' ? 'ACADEMIC' : null
        };
        const newUser = await User.create(newUserData);
        return await authenticateUser(newUser);
      }
      return { success: false, message: 'Invalid credentials or role mismatch.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { success: false, message: 'Invalid credentials or role mismatch.' };
    }

    return await authenticateUser(user);

  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

async function authenticateUser(user: any): Promise<LoginResponse> {
  const token = await signToken({ userId: user._id, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24, // 1 day
    path: '/',
  });

  return { success: true, role: user.role };
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  return { success: true };
}
