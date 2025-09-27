import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { connectToDatabase } from './services/dbService.js';
import submissionRoutes from './routes/submissionRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 7979;

app.use(express.json());

app.use('/submission', submissionRoutes);

const startServer = async () => {
  console.log("Trying to connect to database..");
  await connectToDatabase();
  console.log("Connected to database successfully..");
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();