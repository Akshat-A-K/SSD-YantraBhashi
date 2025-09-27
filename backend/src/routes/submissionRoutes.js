import express from "express";
import { validateCode } from "../controllers/submissionController.js";

const router = express.Router();

router.post('/', validateCode);

export default router;