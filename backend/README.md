# Smart Attendance System - Backend

Backend API for the Smart Attendance System with AI-powered face verification.

## Features

- 🔐 JWT Authentication (Register/Login)
- 👨‍🎓 Student Management
- 📚 Course Management
- ✅ Attendance Tracking
- 🤖 AI Face Verification (Gemini)
- 📍 Geolocation Verification
- 📊 Dashboard Statistics

## Tech Stack

- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- Google Gemini AI
- JWT for Authentication

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your values:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `GEMINI_API_KEY`: Your Google AI Studio API key

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PATCH /api/students/:id/avatar` - Update student avatar

### Courses
- `GET /api/courses` - Get all courses
- `GET /api/courses/:id` - Get course by ID
- `POST /api/courses` - Create course (Faculty/Admin)
- `PUT /api/courses/:id` - Update course
- `POST /api/courses/:id/students` - Add student to course

### Attendance
- `GET /api/attendance/course/:courseId` - Get attendance for course
- `GET /api/attendance/student/:studentId` - Get attendance for student
- `POST /api/attendance/mark` - Mark attendance manually
- `POST /api/attendance/verify` - AI face verification
- `GET /api/attendance/stats/:courseId` - Get course statistics
- `GET /api/attendance/dashboard/stats` - Get dashboard stats

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `FRONTEND_URL` | Frontend URL for CORS |

## Deployment on Vercel

1. Push to GitHub
2. Import project on Vercel
3. Set root directory to `backend`
4. Add environment variables in Vercel dashboard
5. Deploy!
