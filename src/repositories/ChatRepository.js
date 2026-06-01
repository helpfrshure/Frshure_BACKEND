const { ChatMessage } = require('../models');
const { PAGINATION } = require('../constants');

class ChatRepository {
  async create(data) {
    return ChatMessage.create(data);
  }

  async findByChatId(chatId, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      ChatMessage.find({ chatId })
        .populate('sender', 'firstName lastName profilePhoto')
        .populate('receiver', 'firstName lastName profilePhoto')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      ChatMessage.countDocuments({ chatId }),
    ]);

    return {
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getChatList(userId, userModel, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const matchCondition = {
      $or: [
        { sender: userId, senderModel: userModel },
        { receiver: userId, receiverModel: userModel },
      ],
    };

    const chatIds = await ChatMessage.distinct('chatId', matchCondition);

    const total = chatIds.length;
    const paginatedChatIds = chatIds.slice(skip, skip + limit);

    const chatList = await Promise.all(
      paginatedChatIds.map(async (chatId) => {
        const lastMessage = await ChatMessage.findOne({ chatId })
          .sort({ createdAt: -1 })
          .populate('sender', 'firstName lastName profilePhoto')
          .populate('receiver', 'firstName lastName profilePhoto');

        const unreadCount = await ChatMessage.countDocuments({
          chatId,
          receiver: userId,
          receiverModel: userModel,
          isRead: false,
        });

        return {
          chatId,
          lastMessage,
          unreadCount,
        };
      }),
    );

    chatList.sort((a, b) => {
      const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(0);
      const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(0);
      return dateB - dateA;
    });

    return {
      data: chatList,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId, userModel) {
    return ChatMessage.countDocuments({
      receiver: userId,
      receiverModel: userModel,
      isRead: false,
    });
  }

  async getUnreadCountByChat(chatId, userId, userModel) {
    return ChatMessage.countDocuments({
      chatId,
      receiver: userId,
      receiverModel: userModel,
      isRead: false,
    });
  }

  async markAsRead(chatId, userId, userModel) {
    return ChatMessage.updateMany(
      {
        chatId,
        receiver: userId,
        receiverModel: userModel,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      },
    );
  }

  async getOrCreateChatId(senderId, receiverId) {
    const [small, large] = [senderId, receiverId].sort();
    return `${small}_${large}`;
  }

  async countMessages(chatId) {
    return ChatMessage.countDocuments({ chatId });
  }
}

module.exports = new ChatRepository();
