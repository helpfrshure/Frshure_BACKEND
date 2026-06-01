const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const StudentController = require('../controllers/StudentController');
const authenticate = require('../middlewares/auth');
const { ROLES } = require('../constants');
const { authValidators, profileValidators, validate } = require('../validators');
const { uploadSingle } = require('../middlewares/upload');

router.post(
  '/signup',
  authValidators.signupValidator,
  validate,
  AuthController.studentSignup,
);

router.post(
  '/login',
  authValidators.loginValidator,
  validate,
  AuthController.studentLogin,
);

router.post(
  '/logout',
  authenticate(),
  AuthController.logout,
);

router.get(
  '/profile',
  authenticate([ROLES.STUDENT]),
  StudentController.getProfile,
);

router.put(
  '/profile',
  authenticate([ROLES.STUDENT]),
  uploadSingle('profilePhoto'),
  profileValidators.updateStudentProfileValidator,
  validate,
  StudentController.updateProfile,
);

router.get(
  '/applications',
  authenticate([ROLES.STUDENT]),
  StudentController.getApplications,
);

router.get(
  '/saved-jobs',
  authenticate([ROLES.STUDENT]),
  StudentController.getSavedJobs,
);

router.post(
  '/save-job/:jobId',
  authenticate([ROLES.STUDENT]),
  StudentController.saveJob,
);

router.delete(
  '/unsave-job/:jobId',
  authenticate([ROLES.STUDENT]),
  StudentController.unsaveJob,
);

module.exports = router;
