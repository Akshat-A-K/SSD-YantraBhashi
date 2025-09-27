import express from "express";
import { signin, signup, logout, getUserInfo } from "../controllers/userController.js";
import { authenticate } from '../middlewares/auth.js';

const router = express.Router();

router.post('/signin', signin);
router.post('/signup', signup);
router.post('/logout', authenticate, logout);
router.get('/:id', authenticate, getUserInfo);

export default router;