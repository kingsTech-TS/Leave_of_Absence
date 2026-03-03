export type Role = "STAFF" | "STUDENT" | "OFFICIAL";
export type StaffCategory = "ACADEMIC" | "NON_ACADEMIC" | null;

export interface User {
  _id: string;
  idNumber: string; // Staff ID or Matric Number
  name: string;
  email: string;
  department: string;
  faculty: string;
  role: Role;
  staffCategory?: StaffCategory;
  createdAt: string;
}

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface LeaveType {
  id: string;
  label: string;
}

export interface LeaveApplication {
  _id: string;
  userId: string | User;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  academicSession?: string; // For students
  status: LeaveStatus;
  documentUrl?: string; // Optional document upload
  createdAt: string;
  updatedAt: string;
}

export const STUDENT_LEAVE_TYPES: LeaveType[] = [
  { id: "leave_of_absence", label: "Leave of Absence (Academic Session)" },
];

export const ACADEMIC_STAFF_LEAVE_TYPES: LeaveType[] = [
  { id: "sabbatical_leave", label: "Sabbatical Leave" },
  { id: "study_leave", label: "Study Leave" },
  { id: "annual_leave", label: "Annual Leave" },
  { id: "sick_leave", label: "Sick Leave" },
  { id: "maternity_paternity_leave", label: "Maternity / Paternity Leave" },
  { id: "leave_without_pay", label: "Leave Without Pay" },
];

export const NON_ACADEMIC_STAFF_LEAVE_TYPES: LeaveType[] = [
  { id: "compassionate_leave", label: "Compassionate Leave" },
  { id: "casual_leave", label: "Casual Leave" },
  { id: "examination_leave", label: "Examination Leave" },
  { id: "conference_leave", label: "Conference Leave" },
  { id: "annual_leave", label: "Annual Leave" },
  { id: "sick_leave", label: "Sick Leave" },
  { id: "maternity_paternity_leave", label: "Maternity / Paternity Leave" },
  { id: "leave_without_pay", label: "Leave Without Pay" },
];

export type LoginResponse = 
  | { success: true; role: Role }
  | { success: false; message: string };
