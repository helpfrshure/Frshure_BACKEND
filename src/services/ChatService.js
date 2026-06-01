const { ChatRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');
const { getFirebaseDB } = require('../config/firebase');

class ChatService {
  async sendMessage(senderId, senderModel, data) {
    const chatId = await ChatRepository.getOrCreateChatId(senderId, data.receiverId);

    const message = await ChatRepository.create({
      sender: senderId,
      senderModel,
      receiver: data.receiverId,
      receiverModel: data.receiverModel,
      message: data.message,
      messageType: data.messageType || 'text',
      chatId,
    });

    const populatedMessage = await ChatRepository.findByChatId(chatId, { page: 1, limit: 1 });

    this.syncToFirebase(chatId, message);

    const { NotificationService } = require('./NotificationService');
    await NotificationService.sendNewMessage(
      data.receiverId,
      data.receiverModel,
      senderId,
      senderModel,
      data.message,
    );

    return {
      message: populatedMessage.data[0] || message,
      chatId,
    };
  }

  async getChatList(userId, userModel, options = {}) {
    return ChatRepository.getChatList(userId, userModel, options);
  }

  async getMessages(chatId, options = {}) {
    return ChatRepository.findByChatId(chatId, options);
  }

  async markAsRead(chatId, userId, userModel) {
    const result = await ChatRepository.markAsRead(chatId, userId, userModel);
    return result;
  }

  async getUnreadCount(userId, userModel) {
    return ChatRepository.getUnreadCount(userId, userModel);
  }

  syncToFirebase(chatId, message) {
    try {
      const db = getFirebaseDB();
      if (!db) return;

      const ref = db.ref(`chats/${chatId}/messages/${message._id}`);
      ref.set({
        message: message.message,
        senderId: message.sender.toString(),
        senderModel: message.senderModel,
        receiverId: message.receiver.toString(),
        receiverModel: message.receiverModel,
        messageType: message.messageType,
        isRead: message.isRead,
        createdAt: message.createdAt,
      });
    } catch (error) {
      logger.error('Firebase sync failed', { error: error.message });
    }
  }

  async updateTypingStatus(chatId, userId, isTyping) {
    try {
      const db = getFirebaseDB();
      if (!db) return;

      const ref = db.ref(`chats/${chatId}/typing/${userId}`);
      if (isTyping) {
        ref.set({ isTyping: true, updatedAt: new Date().toISOString() });
      } else {
        ref.remove();
      }
    } catch (error) {
      logger.error('Firebase typing status failed', { error: error.message });
    }
  }
}

module.exports = new ChatService();
