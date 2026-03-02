import mongoose from 'mongoose';

const LeaveApplicationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true },
    academicSession: { type: String, default: null }, // Only for students
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    documentUrl: { type: String, default: null }, // Dummy for now
  },
  { timestamps: true }
);

export default mongoose.models.LeaveApplication || mongoose.model('LeaveApplication', LeaveApplicationSchema);
