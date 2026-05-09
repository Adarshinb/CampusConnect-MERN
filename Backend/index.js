// server.js
require("dotenv").config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');

const UserRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const adminRoutes = require("./routes/Admin");

const Message = require('./model/chatModel'); // ensure model exists and exported
require("./config/connection"); // your DB connection

const app = express();

// Basic middlewares
app.use(helmet()); // secure headers
app.use(compression());
app.use(morgan("dev"));
app.use(express.json({ limit: "100kb" })); // limit JSON body size to prevent huge payloads
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
app.use(cookieParser());

// CORS config — restrict origin in production
const FRONTEND = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({
  origin: FRONTEND,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Simple rate limiter for API endpoints (adjust as needed)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // max requests per IP in window
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/api/", apiLimiter);

// static uploads
app.use("/uploads", express.static("uploads"));

// routes
app.use("/api/user", UserRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/admin", adminRoutes);

// Create HTTP server and attach socket.io
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND,
    methods: ["GET", "POST"],
    credentials: true
  },
  // optional: limit the size of individual messages to avoid huge payloads
  maxHttpBufferSize: 1e5 // ~100 KB
});

// If you use JWT for authentication (recommended), verify on socket handshake
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

io.use((socket, next) => {
  // Recommended: pass token via socket.handshake.auth = { token: "..." } from client
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) {
    return next(); // allow unauthenticated if you want public sockets; otherwise: next(new Error("auth error"))
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = { id: payload.id, userType: payload.userType }; // attach user info to socket
    return next();
  } catch (err) {
    console.warn("Socket auth failed:", err.message);
    return next(new Error("Authentication error"));
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id, socket.user ? `userId=${socket.user.id}` : "");

  // Join room: either use socket.user.id (authenticated) or a provided ID
  socket.on('join', ({ userId }) => {
    const room = userId || (socket.user && socket.user.id);
    if (!room) {
      return socket.emit('joinError', { error: 'No userId provided and not authenticated' });
    }
    socket.join(room);
    console.log(`Socket ${socket.id} joined room ${room}`);
  });

  // sendMessage event with basic validation and ack
  // client can use: socket.emit('sendMessage', messageObj, (ack) => { ... })
  socket.on('sendMessage', async (message, ack) => {
    try {
      // Basic validation
      if (!message || typeof message !== 'object') {
        if (typeof ack === 'function') ack({ success: false, error: 'Invalid message format' });
        return;
      }

      const { sender, recipient, content } = message;
      if (!sender || !recipient || !content || content.length > 2000) {
        if (typeof ack === 'function') ack({ success: false, error: 'Missing fields or content too long' });
        return;
      }

      // Optional: enforce sender matches authenticated user
      if (socket.user && socket.user.id && sender !== socket.user.id) {
        console.warn('Sender mismatch:', sender, socket.user.id);
        if (typeof ack === 'function') ack({ success: false, error: 'Sender mismatch' });
        return;
      }

      // Persist message
      const newMessage = new Message({
        sender,
        recipient,
        content,
        timestamp: new Date(),
        delivered: false, // consider fields: delivered, read
      });

      const savedMessage = await newMessage.save();

      // Emit to both sender and recipient rooms
      io.to(sender).emit('message', savedMessage);
      io.to(recipient).emit('message', savedMessage);

      if (typeof ack === 'function') ack({ success: true, message: savedMessage });
    } catch (err) {
      console.error('Error saving message:', err);
      if (typeof ack === 'function') ack({ success: false, error: 'Failed to send message' });
      socket.emit('messageError', { error: 'Failed to send message' });
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected ${socket.id}. Reason: ${reason}`);
  });

  // add other events: typing indicators, read receipts, presence, etc.
});

// error handling middleware (after routes)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err.stack || err);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful shutdown
const PORT = process.env.PORT || 3006;
const serverInstance = server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received: shutting down gracefully');
  serverInstance.close(() => {
    console.log('HTTP server closed');
    // If needed: close DB connections here
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received: shutting down gracefully');
  serverInstance.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
