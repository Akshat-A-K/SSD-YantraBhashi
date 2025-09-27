import express from "express";
import { getAllStudents, getStudentSubmissions, getAllSubmissions } from "../controllers/instructorController.js";
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

// Middleware to check if user is an instructor
const requireInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Instructor role required.' 
    });
  }
  next();
};

// All instructor routes require authentication and instructor role
router.use(authenticate);
router.use(requireInstructor);

// Get all students (only accessible by instructors)
router.get('/students', getAllStudents);

// Get submissions for a specific student
router.get('/students/:studentId/submissions', getStudentSubmissions);

// Get all submissions (instructor view)
router.get('/submissions', getAllSubmissions);

export default router;
