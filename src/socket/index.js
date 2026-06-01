const { Server } = require('socket.io');
const { verifyAccessToken } = require('../utils/token');
const logger = require('../config/logger');
const ChatService = require('../services/ChatService');

let io = null;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const userRole = socket.userRole;

    logger.info(`Socket connected: ${userId} (${userRole})`);

    socket.join(`user:${userId}`);

    if (userRole === 'STUDENT') {
      socket.join(`students`);
    } else if (userRole === 'EMPLOYER') {
      socket.join(`employers`);
    }

    socket.on('join-chat', (chatId) => {
      socket.join(`chat:${chatId}`);
      logger.info(`User ${userId} joined chat ${chatId}`);
    });

    socket.on('leave-chat', (chatId) => {
      socket.leave(`chat:${chatId}`);
    });

    socket.on('send-message', async (data) => {
      try {
        const { receiverId, receiverModel, message, messageType } = data;

        const result = await ChatService.sendMessage(
          userId,
          userRole,
          { receiverId, receiverModel, message, messageType },
        );

        io.to(`chat:${result.chatId}`).emit('new-message', result);
        io.to(`user:${receiverId}`).emit('new-message', result);
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('typing', (data) => {
      const { chatId, receiverId, isTyping } = data;
      io.to(`chat:${chatId}`).emit('user-typing', {
        userId,
        chatId,
        isTyping,
      });

      ChatService.updateTypingStatus(chatId, userId, isTyping);
    });

    socket.on('mark-read', async (data) => {
      try {
        const { chatId } = data;
        await ChatService.markAsRead(chatId, userId, userRole);
        io.to(`chat:${chatId}`).emit('messages-read', {
          chatId,
          readBy: userId,
        });
      } catch (error) {
        socket.emit('error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${userId}`);
    });
  });

  logger.info('Socket.IO initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToChat = (chatId, event, data) => {
  if (io) {
    io.to(`chat:${chatId}`).emit(event, data);
  }
};

module.exports = {
  initializeSocket,
  getIO,
  emitToUser,
  emitToChat,
};
