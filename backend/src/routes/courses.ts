import { Router, Request, Response } from 'express';
import { Course } from '../models/index.js';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all courses
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const courses = await Course.find()
      .populate('facultyId', 'name email')
      .populate('students', 'name email studentId');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get courses by faculty
router.get('/faculty/:facultyId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const courses = await Course.find({ facultyId: req.params.facultyId })
      .populate('students', 'name email studentId');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('facultyId', 'name email')
      .populate('students', 'name email studentId avatarUrl');
    
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

// Create course (Faculty/Admin)
router.post('/', authMiddleware, roleMiddleware('FACULTY', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, code, startTime, endTime, room, coordinates, students } = req.body;

    const course = new Course({
      name,
      code,
      facultyId: req.user?.userId,
      startTime,
      endTime,
      room,
      coordinates,
      students: students || []
    });

    await course.save();
    res.status(201).json(course);
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course' });
  }
});

// Update course
router.put('/:id', authMiddleware, roleMiddleware('FACULTY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Add student to course
router.post('/:id/students', authMiddleware, roleMiddleware('FACULTY', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { studentId } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { students: studentId } },
      { new: true }
    ).populate('students', 'name email studentId');

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add student' });
  }
});

// Delete course
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

export default router;
