import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { setupSocket } from './socket/index.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Seed auto-check
import { seedDatabaseIfEmpty } from './seed.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Setup Socket.io logic
const socketService = setupSocket(io);
// Attach socketService to app so controllers can trigger push notifications if needed
app.set('socketService', socketService);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'Skill Relay API',
    timestamp: new Date(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);

// Central error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB and start server
const startServer = async () => {
  try {
    await connectDB();
    // Auto-seed if database is completely empty
    await seedDatabaseIfEmpty();

    server.listen(PORT, () => {
      console.log(`🚀 Skill Relay Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Server startup failed:', err);
  }
};

startServer();

export { app, server, io };
