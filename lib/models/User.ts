import mongoose from 'mongoose';
import { Role, StaffCategory } from '@/types';

const UserSchema = new mongoose.Schema(
  {
    idNumber: { type: String, required: true, unique: true }, // Staff ID or Matric No.
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    faculty: { type: String, required: true },
    role: { type: String, enum: ['STAFF', 'STUDENT', 'OFFICIAL'], required: true },
    officialLevel: { type: String, enum: ['HOD', 'DEAN', 'VC', null], default: null },
    staffCategory: { type: String, enum: ['ACADEMIC', 'NON_ACADEMIC', null], default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
