/**
 * CHAT SPARK - Real-Time Chat Application Server
 * 
 * TECH STACK:
 * - Node.js & Express.js for REST API
 * - Socket.IO for real-time communication
 * - MongoDB with Mongoose for data persistence
 * - JWT for authentication
 * - Cloudinary for image storage
 * 
 * FEATURES:
 * - User authentication (register/login)
 * - User discovery and search
 * - Chat request system
 * - Real-time 1-to-1 messaging
 * - Message status tracking (sent/delivered/read)
 * - Online/offline status
 * - Typing indicators
 * - Image/GIF/Sticker support
 * - Offline message storage
 */

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const fs = require('fs');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const requestRoutes = require('./routes/requestRoutes');
const conversationRoutes = require('./routes/conversationRoutes');
const messageRoutes = require('./routes/messageRoutes');

// Import middlewares
const { errorHandler, notFound } = require('./middlewares/error');

// Import socket handler
const { initializeSocket } = require('./sockets/socketHandler');

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ==========================================
// MIDDLEWARE CONFIGURATION
// ==========================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging (only in development)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
});

app.use('/api/', limiter);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ==========================================
// DATABASE CONNECTION
// ==========================================

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // These options are no longer needed in Mongoose 6+
      // but kept for compatibility
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit with failure
  }
};

// ==========================================
// ROUTES
// ==========================================

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Chat Spark API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/messages', messageRoutes);

// ==========================================
// ERROR HANDLING
// ==========================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ==========================================
// SOCKET.IO INITIALIZATION
// ==========================================

initializeSocket(io);

// ==========================================
// SERVER STARTUP
// ==========================================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();

    // Start server
    server.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════════╗
║                                           ║
║        🚀 CHAT SPARK SERVER RUNNING       ║
║                                           ║
║   Environment: ${process.env.NODE_ENV?.toUpperCase().padEnd(27) || 'DEVELOPMENT'.padEnd(27)} ║
║   Port: ${PORT.toString().padEnd(34)} ║
║   Socket.IO: ✅ Enabled                   ║
║   MongoDB: ✅ Connected                   ║
║                                           ║
║   API: http://localhost:${PORT.toString().padEnd(18)} ║
║                                           ║
╚═══════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Start the server
startServer();

module.exports = { app, server, io };
