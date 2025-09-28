import express from "express";
import { getAllStudents, getStudentSubmissions, getAllSubmissions } from "../controllers/instructorController.js";
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();


const requireInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Instructor role required.' 
    });
  }
  next();
};


router.use(authenticate);
router.use(requireInstructor);


router.get('/students', getAllStudents);


router.get('/students/:studentId/submissions', getStudentSubmissions);


router.get('/submissions', getAllSubmissions);

export default router;
