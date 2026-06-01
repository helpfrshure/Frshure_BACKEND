const express = require('express');
const router = express.Router();
const PaymentController = require('../controllers/PaymentController');
const authenticate = require('../middlewares/auth');
const { ROLES } = require('../constants');
const { paymentValidators, validate } = require('../validators');
const { paymentLimiter } = require('../middlewares/rateLimiter');

router.post(
  '/create-order',
  authenticate([ROLES.EMPLOYER]),
  paymentLimiter,
  paymentValidators.createOrderValidator,
  validate,
  PaymentController.createOrder,
);

router.post(
  '/verify',
  authenticate([ROLES.EMPLOYER]),
  paymentValidators.verifyPaymentValidator,
  validate,
  PaymentController.verify,
);

router.post(
  '/webhook',
  PaymentController.webhook,
);

module.exports = router;
