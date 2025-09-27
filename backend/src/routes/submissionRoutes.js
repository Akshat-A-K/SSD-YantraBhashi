import express from "express";
import { validateCode, getUserSubmissions, verifySubmission } from "../controllers/submissionController.js";

const router = express.Router();

router.post('/', validateCode);
router.get('/', getUserSubmissions);
router.put('/:submissionId/verify', verifySubmission);

export default router;