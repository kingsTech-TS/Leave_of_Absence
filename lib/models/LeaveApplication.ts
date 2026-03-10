import mongoose from 'mongoose';

const LeaveApplicationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Core user ID or local user ID
    applicantName: { type: String, required: true },
    applicantDepartment: { type: String, required: true },
    applicantFaculty: { type: String, required: true },
    applicantIdNumber: { type: String, required: true },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    academicSession: { type: String, default: null }, // Only for students
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    currentStage: { 
      type: String, 
      enum: ['HOD_APPROVAL', 'DEAN_APPROVAL', 'VC_APPROVAL', 'COMPLETED', 'REJECTED'],
      default: 'HOD_APPROVAL' 
    },
    hodApproval: {
      status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
      comment: { type: String, default: null },
      officialName: { type: String, default: null },
      updatedAt: { type: Date, default: null }
    },
    deanApproval: {
      status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
      comment: { type: String, default: null },
      officialName: { type: String, default: null },
      updatedAt: { type: Date, default: null }
    },
    vcApproval: {
      status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
      comment: { type: String, default: null },
      officialName: { type: String, default: null },
      updatedAt: { type: Date, default: null }
    },
    documentUrl: { type: String, default: null }, 
  },
  { timestamps: true }
);

export default mongoose.models.LeaveApplication || mongoose.model('LeaveApplication', LeaveApplicationSchema);
