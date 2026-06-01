const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const EmployerController = require('../controllers/EmployerController');
const authenticate = require('../middlewares/auth');
const { ROLES } = require('../constants');
const { authValidators, profileValidators, validate } = require('../validators');
const { uploadSingle } = require('../middlewares/upload');

router.post(
  '/signup',
  authValidators.employerSignupValidator,
  validate,
  AuthController.employerSignup,
);

router.post(
  '/login',
  authValidators.loginValidator,
  validate,
  AuthController.employerLogin,
);

router.post(
  '/logout',
  authenticate(),
  AuthController.logout,
);

router.get(
  '/profile',
  authenticate([ROLES.EMPLOYER]),
  EmployerController.getProfile,
);

router.put(
  '/profile',
  authenticate([ROLES.EMPLOYER]),
  uploadSingle('companyLogo'),
  profileValidators.updateEmployerProfileValidator,
  validate,
  EmployerController.updateProfile,
);

router.get(
  '/dashboard',
  authenticate([ROLES.EMPLOYER]),
  EmployerController.getDashboard,
);

router.get(
  '/analytics',
  authenticate([ROLES.EMPLOYER]),
  EmployerController.getAnalytics,
);

module.exports = router;
