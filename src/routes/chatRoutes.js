const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/ChatController');
const authenticate = require('../middlewares/auth');
const { ROLES } = require('../constants');
const { chatValidators, validate } = require('../validators');

router.get(
  '/list',
  authenticate([ROLES.STUDENT, ROLES.EMPLOYER]),
  chatValidators.chatListValidator,
  validate,
  ChatController.getList,
);

router.get(
  '/messages/:chatId',
  authenticate([ROLES.STUDENT, ROLES.EMPLOYER]),
  chatValidators.chatMessagesValidator,
  validate,
  ChatController.getMessages,
);

router.post(
  '/send',
  authenticate([ROLES.STUDENT, ROLES.EMPLOYER]),
  chatValidators.sendMessageValidator,
  validate,
  ChatController.send,
);

module.exports = router;
