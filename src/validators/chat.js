const { body, query } = require('express-validator');

const sendMessageValidator = [
  body('receiverId')
    .notEmpty()
    .withMessage('Receiver ID is required')
    .isMongoId()
    .withMessage('Invalid Receiver ID format'),
  body('receiverModel')
    .notEmpty()
    .withMessage('Receiver model is required')
    .isIn(['Student', 'Employer'])
    .withMessage('Receiver model must be Student or Employer'),
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 5000 })
    .withMessage('Message must not exceed 5000 characters'),
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Message type must be text, image, or file'),
];

const chatListValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be 1-50'),
];

const chatMessagesValidator = [
  query('chatId')
    .notEmpty()
    .withMessage('Chat ID is required'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be 1-100'),
];

module.exports = {
  sendMessageValidator,
  chatListValidator,
  chatMessagesValidator,
};
