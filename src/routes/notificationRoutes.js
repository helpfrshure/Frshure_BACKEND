const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/NotificationController');
const authenticate = require('../middlewares/auth');
const { ROLES } = require('../constants');
const { notificationValidators, validate } = require('../validators');

router.get(
  '/',
  authenticate([ROLES.STUDENT, ROLES.EMPLOYER]),
  notificationValidators.notificationListValidator,
  validate,
  NotificationController.getAll,
);

router.put(
  '/read/:id',
  authenticate([ROLES.STUDENT, ROLES.EMPLOYER]),
  notificationValidators.notificationIdValidator,
  validate,
  NotificationController.markAsRead,
);

router.delete(
  '/delete/:id',
  authenticate([ROLES.STUDENT, ROLES.EMPLOYER]),
  notificationValidators.notificationIdValidator,
  validate,
  NotificationController.delete,
);

module.exports = router;
