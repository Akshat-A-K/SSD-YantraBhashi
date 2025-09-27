import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { connectToDatabase } from './services/dbService.js';
import submissionRoutes from './routes/submissionRoutes.js';
import userRoutes from './routes/userRoutes.js';
import { authenticate } from './middlewares/auth.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7979;

app.use(express.json());
app.use(cookieParser());

app.use('/submission', authenticate, submissionRoutes);
app.use('/user', userRoutes);

const startServer = async () => {
  console.log("Trying to connect to database..");
  await connectToDatabase();
  console.log("Connected to database successfully..");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();