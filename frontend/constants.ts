
import { UserRole, User, Course } from './types';

export const CURRENT_USER: User = {
  id: 'f123',
  name: 'Dr. Sarah Jenkins',
  role: UserRole.FACULTY,
  email: 'sarah.j@college.edu',
  department: 'Computer Science',
  avatarUrl: 'https://picsum.photos/seed/sarah/200'
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'cs101',
    name: 'Introduction to AI',
    code: 'CS101',
    facultyId: 'f123',
    startTime: '09:00',
    endTime: '10:30',
    room: 'Hall A1',
    coordinates: { lat: 40.7128, lng: -74.0060 }
  },
  {
    id: 'cs202',
    name: 'Advanced Data Structures',
    code: 'CS202',
    facultyId: 'f123',
    startTime: '11:00',
    endTime: '12:30',
    room: 'Lab 4',
    coordinates: { lat: 40.7130, lng: -74.0065 }
  }
];

export const MOCK_STUDENTS: User[] = [
  { id: 's001', name: 'Alex Rivera', role: UserRole.STUDENT, email: 'alex@edu.com', department: 'CS', studentId: '2024001', avatarUrl: 'https://picsum.photos/seed/alex/200' },
  { id: 's002', name: 'Maya Chen', role: UserRole.STUDENT, email: 'maya@edu.com', department: 'CS', studentId: '2024002', avatarUrl: 'https://picsum.photos/seed/maya/200' },
  { id: 's003', name: 'Jordan Smith', role: UserRole.STUDENT, email: 'jordan@edu.com', department: 'CS', studentId: '2024003', avatarUrl: 'https://picsum.photos/seed/jordan/200' },
  { id: 's004', name: 'Leo Gupta', role: UserRole.STUDENT, email: 'leo@edu.com', department: 'CS', studentId: '2024004', avatarUrl: 'https://picsum.photos/seed/leo/200' },
  { id: 's005', name: 'Zoe Barnes', role: UserRole.STUDENT, email: 'zoe@edu.com', department: 'CS', studentId: '2024005', avatarUrl: 'https://picsum.photos/seed/zoe/200' },
];

export const GEOLOCATION_THRESHOLD_METERS = 50;
