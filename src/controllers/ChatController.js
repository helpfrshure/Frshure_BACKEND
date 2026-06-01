const { ChatService } = require('../services');
const { sendSuccess } = require('../utils/response');

class ChatController {
  async getList(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await ChatService.getChatList(req.userId, req.userRole, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      return sendSuccess(res, 200, 'Chat list retrieved', result.data);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { page, limit } = req.query;
      const { chatId } = req.params;
      const result = await ChatService.getMessages(chatId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50,
      });

      await ChatService.markAsRead(chatId, req.userId, req.userRole);

      return sendSuccess(res, 200, 'Messages retrieved', {
        messages: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async send(req, res, next) {
    try {
      const result = await ChatService.sendMessage(
        req.userId,
        req.userRole,
        req.body,
      );
      return sendSuccess(res, 201, 'Message sent', result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
