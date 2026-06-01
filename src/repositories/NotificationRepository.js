const { Notification } = require('../models');
const { PAGINATION } = require('../constants');

class NotificationRepository {
  async create(data) {
    return Notification.create(data);
  }

  async createMany(dataArray) {
    return Notification.insertMany(dataArray);
  }

  async findById(id) {
    return Notification.findById(id);
  }

  async findByRecipient(recipientId, recipientModel, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = {
      recipient: recipientId,
      recipientModel,
    };

    if (options.unreadOnly) {
      filter.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Notification.countDocuments(filter),
    ]);

    return {
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async markAsRead(id) {
    return Notification.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true },
    );
  }

  async markAllAsRead(recipientId, recipientModel) {
    return Notification.updateMany(
      { recipient: recipientId, recipientModel, isRead: false },
      { isRead: true, readAt: new Date() },
    );
  }

  async deleteById(id) {
    return Notification.findByIdAndDelete(id);
  }

  async deleteAllForUser(recipientId, recipientModel) {
    return Notification.deleteMany({ recipient: recipientId, recipientModel });
  }

  async getUnreadCount(recipientId, recipientModel) {
    return Notification.countDocuments({
      recipient: recipientId,
      recipientModel,
      isRead: false,
    });
  }

  async countNotifications(query = {}) {
    return Notification.countDocuments(query);
  }
}

module.exports = new NotificationRepository();
