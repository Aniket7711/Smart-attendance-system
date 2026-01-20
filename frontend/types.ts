
export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department: string;
  avatarUrl?: string;
  studentId?: string;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  facultyId: string;
  startTime: string; // HH:mm
  endTime: string;
  room: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  timestamp: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  verificationMethod: 'AI_FACE' | 'MANUAL' | 'QR';
  geolocationVerified: boolean;
  confidenceScore?: number;
}

export interface VerificationResult {
  verified: boolean;
  confidence: number;
  message: string;
  detectedName?: string;
}
