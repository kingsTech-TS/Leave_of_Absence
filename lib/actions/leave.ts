'use server';

import dbConnect from '../mongodb';
import LeaveApplication from '../models/LeaveApplication';
import { getCoreUser } from '../core-user';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function submitLeave(data: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await getCoreUser(token) : null;
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await dbConnect();
    
    const newLeave = await LeaveApplication.create({
      userId: user.id || user._id,
      applicantName: user.name,
      applicantIdNumber: user.idNumber || user.matricNumber || user.staffId,
      applicantDepartment: user.department,
      ...data,
    });

    revalidatePath(`/${user.role.toLowerCase()}/dashboard`);
    revalidatePath(`/${user.role.toLowerCase()}/history`);

    return { success: true, message: 'Leave application submitted successfully', data: JSON.parse(JSON.stringify(newLeave)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserLeaves() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await getCoreUser(token) : null;
    if (!user) return { success: false, message: 'Unauthorized' };

    await dbConnect();
    const leaves = await LeaveApplication.find({ userId: user.id || user._id }).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(leaves)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getAllLeaves() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await getCoreUser(token) : null;
    if (!user || user.role !== 'OFFICIAL') return { success: false, message: 'Unauthorized' };

    await dbConnect();
    const leaves = await LeaveApplication.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(leaves)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateLeaveStatus(leaveId: string, status: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const user = token ? await getCoreUser(token) : null;
    if (!user || user.role !== 'OFFICIAL') return { success: false, message: 'Unauthorized' };

    await dbConnect();
    await LeaveApplication.findByIdAndUpdate(leaveId, { status });
    revalidatePath('/official');
    return { success: true, message: 'Status updated' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
