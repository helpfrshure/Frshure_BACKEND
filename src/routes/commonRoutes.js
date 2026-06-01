const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const authenticate = require('../middlewares/auth');
const { authValidators, validate } = require('../validators');

router.post(
  '/refresh-token',
  authValidators.refreshTokenValidator,
  validate,
  AuthController.refreshToken,
);

router.put(
  '/change-password',
  authenticate(),
  authValidators.changePasswordValidator,
  validate,
  AuthController.changePassword,
);

module.exports = router;
