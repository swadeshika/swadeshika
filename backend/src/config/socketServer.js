// Socket.IO Server Configuration

const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

/**
 * Initialize Socket.IO server with HTTP server
 */
function initSocketServer(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST']
    },
    // Add ping timeout to handle disconnections
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      console.log('❌ Socket connection rejected: No token provided');
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Only allow admin users to connect
      if (decoded.role?.toLowerCase() !== 'admin') {
        console.log('❌ Socket connection rejected: Not an admin', decoded.role);
        return next(new Error('Not authorized - Admin access only'));
      }

      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      console.log('❌ Socket authentication failed:', err.message);
      return next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Admin connected: ${socket.userEmail} (ID: ${socket.userId})`);
    
    // Join admin room (for broadcasting to all admins)
    socket.join('admins');

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`⚠️  Admin disconnected: ${socket.userEmail} - Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('🔌 Socket.IO server initialized');
  return io;
}

/**
 * Get the Socket.IO instance
 */
function getIO() {
  if (!io) {
    throw new Error('Socket.IO not initialized! Call initSocketServer first.');
  }
  return io;
}

/**
 * Emit notification to all connected admins
 */
function emitToAdmins(event, data) {
  if (!io) {
    console.warn('⚠️  Socket.IO not initialized, cannot emit event:', event);
    return;
  }
  io.to('admins').emit(event, data);
  console.log(`📡 Emitted ${event} to all admins:`, data.title || data);
}

module.exports = { initSocketServer, getIO, emitToAdmins };
