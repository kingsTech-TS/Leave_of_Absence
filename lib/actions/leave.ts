'use server';

import dbConnect from '../mongodb';
import LeaveApplication from '../models/LeaveApplication';
import { getSession } from '../auth';
import { revalidatePath } from 'next/cache';

export async function submitLeave(data: any) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: 'Unauthorized' };
    }

    await dbConnect();
    
    const newLeave = await LeaveApplication.create({
      userId: session._id,
      ...data,
    });

    revalidatePath(`/${session.role.toLowerCase()}/dashboard`);
    revalidatePath(`/${session.role.toLowerCase()}/history`);

    return { success: true, message: 'Leave application submitted successfully', data: JSON.parse(JSON.stringify(newLeave)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getUserLeaves() {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: 'Unauthorized' };

    await dbConnect();
    const leaves = await LeaveApplication.find({ userId: session._id }).sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(leaves)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getAllLeaves() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized' };

    await dbConnect();
    const leaves = await LeaveApplication.find().populate('userId', 'name idNumber department faculty').sort({ createdAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(leaves)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function updateLeaveStatus(leaveId: string, status: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return { success: false, message: 'Unauthorized' };

    await dbConnect();
    await LeaveApplication.findByIdAndUpdate(leaveId, { status });
    revalidatePath('/admin');
    return { success: true, message: 'Status updated' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
