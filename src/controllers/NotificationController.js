const { NotificationService } = require('../services');
const { sendSuccess } = require('../utils/response');

class NotificationController {
  async getAll(req, res, next) {
    try {
      const { page, limit, unreadOnly } = req.query;
      const result = await NotificationService.getNotifications(
        req.userId,
        req.userRole,
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 20,
          unreadOnly: unreadOnly === 'true',
        },
      );
      return sendSuccess(res, 200, 'Notifications retrieved', {
        notifications: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.params.id);
      return sendSuccess(res, 200, 'Notification marked as read', notification);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await NotificationService.deleteNotification(req.params.id);
      return sendSuccess(res, 200, 'Notification deleted');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NotificationController();
