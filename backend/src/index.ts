import express from 'express';
const app = express();

import dotenv from 'dotenv';
dotenv.config();

import cors from 'cors';
import fileUploader from 'express-fileupload';
import path from 'path'; // ✅

app.use(express.static(path.join(__dirname, '../public')));


import { cloudinaryConnect } from '../config/cloudinary';
import { prisma } from '../config/prismaClient';
import authRoutes from '../routes/auth';
import taskRoutes from '../routes/tasks';

// ✅ Serve static HTML files
app.use(express.static(path.join(__dirname, '../public')));

// Connect to database
prisma.$connect()
  .then(() => console.log("✅ Connected to the database"))
  .catch((err) => console.error("❌ Failed to connect to database", err));

// CORS configuration
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5000'];


app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.options('*', cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'Content-Type', 'Authorization'],
  credentials: true,
}));

// Middleware
app.use(express.json());
cloudinaryConnect();

app.use(fileUploader({
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/task', taskRoutes);

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
