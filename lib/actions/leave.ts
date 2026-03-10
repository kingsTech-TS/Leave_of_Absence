'use server';

import dbConnect from '../mongodb';
import LeaveApplication from '../models/LeaveApplication';
import { getCoreUser } from '../core-user';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function submitLeave(data: any) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = token ? await getCoreUser(token) : null;
    if (!user) {
      return { success: false, message: 'Unauthorized' };
    }

    await dbConnect();
    
    let initialStage = 'HOD_APPROVAL';
    const hodStatus = 'PENDING';
    const deanStatus = 'PENDING';
    
    if (user.role === 'OFFICIAL') {
      if (user.officialLevel === 'HOD') {
        initialStage = 'DEAN_APPROVAL';
      } else if (user.officialLevel === 'DEAN') {
        initialStage = 'VC_APPROVAL';
      } else if (user.officialLevel === 'VC') {
        return { success: false, message: 'The VC does not need to apply for leave of absence.' };
      }
    }

    const newLeave = await LeaveApplication.create({
      userId: user.id || user._id,
      applicantName: user.name,
      applicantIdNumber: user.idNumber || user.matricNumber || user.staffId,
      applicantDepartment: user.department || 'N/A',
      applicantFaculty: user.faculty || 'N/A',
      ...data,
      status: 'PENDING',
      currentStage: initialStage,
      hodApproval: { status: initialStage === 'HOD_APPROVAL' ? 'PENDING' : 'N/A' },
      deanApproval: { status: (initialStage === 'HOD_APPROVAL' || initialStage === 'DEAN_APPROVAL') ? 'PENDING' : 'N/A' },
      vcApproval: { status: 'PENDING' },
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
    const token = cookieStore.get('auth_token')?.value;
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
    const token = cookieStore.get('auth_token')?.value;
    const user = token ? await getCoreUser(token) : null;
    console.log('[getAllLeaves] User Context:', { 
      role: user?.role, 
      level: user?.officialLevel, 
      dept: user?.department, 
      fac: user?.faculty 
    });
    
    if (!user || user.role !== 'OFFICIAL') return { success: false, message: 'Unauthorized' };

    await dbConnect();
    
    let query: any = {};
    let searchStage: string[] = ['HOD_APPROVAL', 'DEAN_APPROVAL', 'VC_APPROVAL'];

    // Specific Stage determination based on official level
    if (user.officialLevel === 'HOD') searchStage = ['HOD_APPROVAL'];
    else if (user.officialLevel === 'DEAN') searchStage = ['DEAN_APPROVAL'];
    else if (user.officialLevel === 'VC') searchStage = ['VC_APPROVAL'];

    // Looser query: match applications in relevant jurisdiction or match ANY if jurisdiction missing
    if (user.officialLevel === 'HOD' && user.department) {
      // Look for the user's department anywhere in the string
      query = { 
        applicantDepartment: { $regex: new RegExp(user.department, 'i') }, 
        currentStage: { $in: searchStage } 
      };
    } else if (user.officialLevel === 'DEAN' && user.faculty) {
      query = { 
        applicantFaculty: { $regex: new RegExp(user.faculty, 'i') }, 
        currentStage: { $in: searchStage } 
      };
    } else {
      // If VC OR if department/faculty context is missing, show ALL relevant pending stages
      query = { currentStage: { $in: searchStage } };
    }

    console.log('[getAllLeaves] Finding leaves with query:', JSON.stringify(query));
    const leaves = await LeaveApplication.find(query).sort({ createdAt: -1 }).lean();
    
    // If still nothing found with jurisdiction, and jurisdiction was specified, try a very broad fallback
    if (leaves.length === 0 && (user.department || user.faculty)) {
        console.log('[getAllLeaves] No localized results, broadening query fallback...');
        const broadLeaves = await LeaveApplication.find({ currentStage: { $in: searchStage } }).limit(50).lean();
        if (broadLeaves.length > 0) {
            console.log(`[getAllLeaves] Broad fallback found ${broadLeaves.length} items`);
            return { success: true, data: JSON.parse(JSON.stringify(broadLeaves)) };
        }
    }

    return { success: true, data: JSON.parse(JSON.stringify(leaves)) };
  } catch (error: any) {
    console.error('[getAllLeaves] Error:', error);
    return { success: false, message: error.message };
  }
}

export async function updateLeaveStatus(leaveId: string, status: 'APPROVED' | 'REJECTED', comment?: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = token ? await getCoreUser(token) : null;
    if (!user || user.role !== 'OFFICIAL') return { success: false, message: 'Unauthorized' };

    await dbConnect();
    
    const leave = await LeaveApplication.findById(leaveId);
    if (!leave) return { success: false, message: 'Leave application not found' };

    const update: any = {};
    const timestamp = new Date();

    if (status === 'REJECTED') {
      update.status = 'REJECTED';
      update.currentStage = 'REJECTED';
      
      // Update the correct approval step based on current stage
      if (leave.currentStage === 'HOD_APPROVAL') {
        update.hodApproval = { status: 'REJECTED', comment, officialName: user.name, updatedAt: timestamp };
      } else if (leave.currentStage === 'DEAN_APPROVAL') {
        update.deanApproval = { status: 'REJECTED', comment, officialName: user.name, updatedAt: timestamp };
      } else if (leave.currentStage === 'VC_APPROVAL') {
        update.vcApproval = { status: 'REJECTED', comment, officialName: user.name, updatedAt: timestamp };
      }
    } else {
      // Logic for APPROVED status
      if (leave.currentStage === 'HOD_APPROVAL') {
        update.currentStage = 'DEAN_APPROVAL';
        update.hodApproval = { status: 'APPROVED', comment, officialName: user.name, updatedAt: timestamp };
      } else if (leave.currentStage === 'DEAN_APPROVAL') {
        update.currentStage = 'VC_APPROVAL';
        update.deanApproval = { status: 'APPROVED', comment, officialName: user.name, updatedAt: timestamp };
      } else if (leave.currentStage === 'VC_APPROVAL') {
        update.currentStage = 'COMPLETED';
        update.status = 'APPROVED';
        update.vcApproval = { status: 'APPROVED', comment, officialName: user.name, updatedAt: timestamp };
      }
    }

    await LeaveApplication.findByIdAndUpdate(leaveId, update);
    revalidatePath('/official');
    revalidatePath('/student/dashboard');
    revalidatePath('/student/history');
    return { success: true, message: `Application ${status.toLowerCase()} successfully` };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}

export async function getProcessedLeaves() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    const user = token ? await getCoreUser(token) : null;
    if (!user || user.role !== 'OFFICIAL') return { success: false, message: 'Unauthorized' };

    await dbConnect();
    
    // Find leaves where this official (by name) has participated in ANY approval stage
    const query = {
      $or: [
        { 'hodApproval.officialName': user.name },
        { 'deanApproval.officialName': user.name },
        { 'vcApproval.officialName': user.name }
      ]
    };

    const leaves = await LeaveApplication.find(query).sort({ updatedAt: -1 }).lean();
    return { success: true, data: JSON.parse(JSON.stringify(leaves)) };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
}
