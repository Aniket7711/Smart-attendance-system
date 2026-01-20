import { Router, Request, Response } from 'express';
import { User } from '../models/index.js';
import { authMiddleware, AuthRequest, roleMiddleware } from '../middleware/auth.js';

const router = Router();

// Get all students
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const students = await User.find({ role: 'STUDENT' }).select('-password');
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Get student by ID
router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const student = await User.findById(req.params.id).select('-password');
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch student' });
  }
});

// Update student avatar
router.patch('/:id/avatar', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { avatarUrl } = req.body;
    const student = await User.findByIdAndUpdate(
      req.params.id,
      { avatarUrl },
      { new: true }
    ).select('-password');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// Delete student (Admin only)
router.delete('/:id', authMiddleware, roleMiddleware('ADMIN'), async (req: Request, res: Response) => {
  try {
    const student = await User.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete student' });
  }
});

export default router;
