import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../types/index.js';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  department: string;
  avatarUrl?: string;
  studentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
      type: String, 
      enum: Object.values(UserRole), 
      default: UserRole.STUDENT 
    },
    department: { type: String, required: true },
    avatarUrl: { type: String },
    studentId: { type: String, unique: true, sparse: true }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUserDocument>('User', userSchema);
