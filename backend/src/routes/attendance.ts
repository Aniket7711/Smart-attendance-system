import { Router, Request, Response } from 'express';
import { Attendance, Course, User } from '../models/index.js';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.js';
import { geminiService } from '../services/geminiService.js';

const router = Router();

// Get attendance records for a course
router.get('/course/:courseId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const query: any = { courseId: req.params.courseId };
    
    if (date) {
      query.date = date;
    }

    const records = await Attendance.find(query)
      .populate('studentId', 'name email studentId avatarUrl')
      .sort({ timestamp: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get attendance for a student
router.get('/student/:studentId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const records = await Attendance.find({ studentId: req.params.studentId })
      .populate('courseId', 'name code')
      .sort({ date: -1 });

    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Mark attendance manually
router.post('/mark', authMiddleware, roleMiddleware('FACULTY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, status, date } = req.body;

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, courseId, date: attendanceDate },
      {
        studentId,
        courseId,
        date: attendanceDate,
        status: status || 'PRESENT',
        verificationMethod: 'MANUAL',
        geolocationVerified: false,
        timestamp: new Date()
      },
      { upsert: true, new: true }
    ).populate('studentId', 'name email studentId');

    res.json(attendance);
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
});

// AI Face verification and attendance marking
router.post('/verify', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { studentId, courseId, imageBase64, latitude, longitude } = req.body;

    // Get student info
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Get course info for geolocation check
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // AI Face verification
    const verificationResult = await geminiService.verifyAttendance(imageBase64, student.name);

    // Geolocation verification
    let geolocationVerified = false;
    if (latitude && longitude && course.coordinates) {
      const distance = Math.sqrt(
        Math.pow(latitude - course.coordinates.lat, 2) +
        Math.pow(longitude - course.coordinates.lng, 2)
      ) * 111320; // degree to meters approx

      geolocationVerified = distance < 50; // 50 meters threshold
    }

    // Determine status based on time
    const now = new Date();
    const [startHour, startMin] = course.startTime.split(':').map(Number);
    const courseStart = new Date();
    courseStart.setHours(startHour, startMin, 0);

    let status: 'PRESENT' | 'LATE' | 'ABSENT' = 'ABSENT';
    if (verificationResult.verified && verificationResult.confidence > 0.6) {
      const diffMinutes = (now.getTime() - courseStart.getTime()) / 60000;
      status = diffMinutes > 15 ? 'LATE' : 'PRESENT';
    }

    // Save attendance if verified
    let attendance = null;
    if (verificationResult.verified) {
      const attendanceDate = now.toISOString().split('T')[0];
      
      attendance = await Attendance.findOneAndUpdate(
        { studentId, courseId, date: attendanceDate },
        {
          studentId,
          courseId,
          date: attendanceDate,
          status,
          verificationMethod: 'AI_FACE',
          geolocationVerified,
          confidenceScore: verificationResult.confidence,
          timestamp: now
        },
        { upsert: true, new: true }
      );
    }

    res.json({
      verification: verificationResult,
      geolocationVerified,
      attendance,
      status
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// Get attendance statistics
router.get('/stats/:courseId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    
    const stats = await Attendance.aggregate([
      { $match: { courseId: courseId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRecords = await Attendance.countDocuments({ courseId });
    const uniqueDates = await Attendance.distinct('date', { courseId });

    res.json({
      statusBreakdown: stats,
      totalRecords,
      totalSessions: uniqueDates.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get dashboard stats
router.get('/dashboard/stats', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Today's attendance
    const todayRecords = await Attendance.find({ date: today });
    const presentToday = todayRecords.filter(r => r.status === 'PRESENT').length;
    const lateToday = todayRecords.filter(r => r.status === 'LATE').length;

    // Weekly attendance rate
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyRecords = await Attendance.find({
      date: { $gte: weekAgo.toISOString().split('T')[0] }
    });
    
    const totalWeekly = weeklyRecords.length;
    const presentWeekly = weeklyRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;
    const weeklyRate = totalWeekly > 0 ? (presentWeekly / totalWeekly * 100).toFixed(1) : 0;

    // Defaulters (students with < 75% attendance)
    const studentAttendance = await Attendance.aggregate([
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          present: {
            $sum: {
              $cond: [{ $in: ['$status', ['PRESENT', 'LATE']] }, 1, 0]
            }
          }
        }
      },
      {
        $project: {
          studentId: '$_id',
          rate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] }
        }
      },
      { $match: { rate: { $lt: 75 } } }
    ]);

    res.json({
      today: {
        present: presentToday,
        late: lateToday,
        total: todayRecords.length
      },
      weeklyRate,
      defaultersCount: studentAttendance.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
