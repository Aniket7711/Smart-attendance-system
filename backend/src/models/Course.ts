import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseDocument extends Document {
  name: string;
  code: string;
  facultyId: mongoose.Types.ObjectId;
  startTime: string;
  endTime: string;
  room: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  students: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourseDocument>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }]
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourseDocument>('Course', courseSchema);
