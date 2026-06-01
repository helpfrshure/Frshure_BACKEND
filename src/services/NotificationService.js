const { NotificationRepository } = require('../repositories');
const { NOTIFICATION_TYPES } = require('../constants');
const { getFirebaseMessaging } = require('../config/firebase');
const logger = require('../config/logger');

class NotificationService {
  async sendNotification(recipientId, recipientModel, type, title, message, data = {}) {
    const notification = await NotificationRepository.create({
      recipient: recipientId,
      recipientModel,
      type,
      title,
      message,
      data,
    });

    await this.sendPushNotification(recipientId, recipientModel, title, message, data);

    return notification;
  }

  async sendPushNotification(recipientId, recipientModel, title, message, data = {}) {
    try {
      const messaging = getFirebaseMessaging();
      if (!messaging) return;

      const payload = {
        notification: {
          title,
          body: message,
        },
        data: {
          ...data,
          type: data.type || 'general',
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        topic: `${recipientModel.toLowerCase()}_${recipientId}`,
      };

      const response = await messaging.send(payload);

      logger.info(`Push notification sent: ${response}`);

      return response;
    } catch (error) {
      logger.error('Push notification failed', { error: error.message });
      return null;
    }
  }

  async sendApplicationAccepted(studentId, jobId, jobTitle) {
    return this.sendNotification(
      studentId,
      'Student',
      NOTIFICATION_TYPES.APPLICATION_ACCEPTED,
      'Application Accepted!',
      `Congratulations! Your application for "${jobTitle}" has been accepted.`,
      { jobId, type: 'application_accepted' },
    );
  }

  async sendApplicationRejected(studentId, jobId, jobTitle) {
    return this.sendNotification(
      studentId,
      'Student',
      NOTIFICATION_TYPES.APPLICATION_REJECTED,
      'Application Update',
      `Your application for "${jobTitle}" was not selected. Keep applying!`,
      { jobId, type: 'application_rejected' },
    );
  }

  async sendNewMessage(receiverId, receiverModel, senderId, senderModel, messagePreview) {
    const shortMessage = messagePreview.length > 100
      ? messagePreview.substring(0, 100) + '...'
      : messagePreview;

    return this.sendNotification(
      receiverId,
      receiverModel,
      NOTIFICATION_TYPES.NEW_MESSAGE,
      'New Message',
      shortMessage,
      { senderId, senderModel, type: 'new_message' },
    );
  }

  async sendPaymentSuccess(employerId, jobId) {
    return this.sendNotification(
      employerId,
      'Employer',
      NOTIFICATION_TYPES.PAYMENT_SUCCESS,
      'Payment Successful',
      'Your job post is now active and visible to students.',
      { jobId, type: 'payment_success' },
    );
  }

  async sendEmployerApproved(employerId) {
    return this.sendNotification(
      employerId,
      'Employer',
      NOTIFICATION_TYPES.EMPLOYER_APPROVED,
      'Account Approved',
      'Your employer account has been approved. You can now post jobs.',
      { type: 'employer_approved' },
    );
  }

  async getNotifications(recipientId, recipientModel, options = {}) {
    return NotificationRepository.findByRecipient(recipientId, recipientModel, options);
  }

  async markAsRead(notificationId) {
    const notification = await NotificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return NotificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(recipientId, recipientModel) {
    return NotificationRepository.markAllAsRead(recipientId, recipientModel);
  }

  async deleteNotification(notificationId) {
    const notification = await NotificationRepository.findById(notificationId);
    if (!notification) {
      throw new Error('Notification not found');
    }
    return NotificationRepository.deleteById(notificationId);
  }

  async getUnreadCount(recipientId, recipientModel) {
    return NotificationRepository.getUnreadCount(recipientId, recipientModel);
  }
}

module.exports = new NotificationService();
