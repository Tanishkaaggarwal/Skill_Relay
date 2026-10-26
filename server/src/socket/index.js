import { Message } from '../models/Message.js';
import { Session } from '../models/Session.js';

export const setupSocket = (io) => {
  // Map of userId -> Set of socketIds
  const userSocketMap = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Register user socket
    socket.on('register_user', (userId) => {
      if (!userId) return;
      socket.userId = userId;
      if (!userSocketMap.has(userId)) {
        userSocketMap.set(userId, new Set());
      }
      userSocketMap.get(userId).add(socket.id);
      console.log(`👤 User registered on socket: ${userId}`);
    });

    // Join a specific session room
    socket.on('join_session', ({ sessionId, user }) => {
      const room = `session_${sessionId}`;
      socket.join(room);
      console.log(`💬 User ${user?.name || socket.id} joined room ${room}`);
      
      // Notify other participants in room
      socket.to(room).emit('user_joined_session', {
        user,
        sessionId,
      });
    });

    // Leave a specific session room
    socket.on('leave_session', ({ sessionId, user }) => {
      const room = `session_${sessionId}`;
      socket.leave(room);
      console.log(`👋 User ${user?.name || socket.id} left room ${room}`);
    });

    // Handle sending a chat message
    socket.on('send_message', async ({ sessionId, senderId, content }) => {
      try {
        if (!sessionId || !senderId || !content?.trim()) return;

        const message = await Message.create({
          sessionId,
          sender: senderId,
          content: content.trim(),
        });

        const populatedMessage = await Message.findById(message._id).populate(
          'sender',
          'name avatar major'
        );

        const room = `session_${sessionId}`;
        io.to(room).emit('receive_message', populatedMessage);
      } catch (err) {
        console.error('Socket message error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ sessionId, user }) => {
      socket.to(`session_${sessionId}`).emit('user_typing', { user, sessionId });
    });

    socket.on('typing_stop', ({ sessionId, user }) => {
      socket.to(`session_${sessionId}`).emit('user_stop_typing', { user, sessionId });
    });

    // Sync session completion confirmation
    socket.on('session_confirmation_updated', ({ sessionId, updatedSession }) => {
      io.to(`session_${sessionId}`).emit('session_updated', updatedSession);
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      if (socket.userId && userSocketMap.has(socket.userId)) {
        const set = userSocketMap.get(socket.userId);
        set.delete(socket.id);
        if (set.size === 0) {
          userSocketMap.delete(socket.userId);
        }
      }
    });
  });

  return {
    sendNotificationToUser: (userId, notification) => {
      if (userSocketMap.has(userId.toString())) {
        const socketIds = userSocketMap.get(userId.toString());
        socketIds.forEach((sid) => {
          io.to(sid).emit('new_notification', notification);
        });
      }
    },
  };
};
