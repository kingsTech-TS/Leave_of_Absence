import mongoose from 'mongoose';

const LeaveApplicationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // Core user ID
    applicantName: { type: String, required: true },
    applicantDepartment: { type: String, required: true },
    applicantIdNumber: { type: String, required: true },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    academicSession: { type: String, default: null }, // Only for students
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    documentUrl: { type: String, default: null }, 
  },
  { timestamps: true }
);

export default mongoose.models.LeaveApplication || mongoose.model('LeaveApplication', LeaveApplicationSchema);
