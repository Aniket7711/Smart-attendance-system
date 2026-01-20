import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendanceDocument extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  date: string;
  timestamp: Date;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  verificationMethod: 'AI_FACE' | 'MANUAL' | 'QR';
  geolocationVerified: boolean;
  confidenceScore?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendanceDocument>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    date: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['PRESENT', 'LATE', 'ABSENT', 'EXCUSED'], 
      default: 'PRESENT' 
    },
    verificationMethod: { 
      type: String, 
      enum: ['AI_FACE', 'MANUAL', 'QR'], 
      required: true 
    },
    geolocationVerified: { type: Boolean, default: false },
    confidenceScore: { type: Number },
    imageUrl: { type: String }
  },
  { timestamps: true }
);

// Index to ensure unique attendance per student per course per day
attendanceSchema.index({ studentId: 1, courseId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model<IAttendanceDocument>('Attendance', attendanceSchema);
