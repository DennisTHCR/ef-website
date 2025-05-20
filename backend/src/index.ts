import express from 'express';
import cors from 'cors';
import { createConnection, getManager } from 'typeorm';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import cardRoutes from './routes/card.routes';
import battleRoutes from './routes/battle.routes';
import trainerRoutes from './routes/trainer.routes';
import tradeRoutes from './routes/trade.routes';
import adminRoutes from './routes/admin.routes';
import seasonRoutes from './routes/season.routes';
import { errorMiddleware } from './middleware/error.middleware';
import { dbConfig } from './config/database';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/battles', battleRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/seasons', seasonRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Database connection and server startup
const startServer = async () => {
  try {
    await createConnection(dbConfig);
    console.log('Database connected successfully');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
  }
};

startServer();
