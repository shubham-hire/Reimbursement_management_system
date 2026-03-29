import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

export const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
