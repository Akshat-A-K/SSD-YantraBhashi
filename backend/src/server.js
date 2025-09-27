import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { connectToDatabase } from './services/dbService.js';
import submissionRoutes from './routes/submissionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { authenticate } from './middlewares/auth.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7979;

app.use(cors({
  origin: (origin, callback) => {
    const allowed = [process.env.FRONTEND_ORIGIN || 'http://localhost:3000'];
    
    
    if (!origin) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-Code'],
  exposedHeaders: ['Content-Length', 'X-Request-Id']
}));

app.use(express.json());
app.use(cookieParser());

app.use('/submission', authenticate, submissionRoutes);
app.use('/user', userRoutes);
app.use('/instructor', instructorRoutes);
app.use('/ai', aiRoutes);

const startServer = async () => {
  console.log("Trying to connect to database..");
  await connectToDatabase();
  console.log("Connected to database successfully..");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();