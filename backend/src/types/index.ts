export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT'
}

export interface IUser {
  id: string;
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

export interface ICourse {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  startTime: string;
  endTime: string;
  room: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  students: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  timestamp: Date;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  verificationMethod: 'AI_FACE' | 'MANUAL' | 'QR';
  geolocationVerified: boolean;
  confidenceScore?: number;
  imageUrl?: string;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  message: string;
  detectedName?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}
