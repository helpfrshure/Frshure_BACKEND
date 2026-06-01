const express = require('express');
const router = express.Router();
const ApplicationController = require('../controllers/ApplicationController');
const authenticate = require('../middlewares/auth');
const { ROLES } = require('../constants');
const { applicationValidators, validate } = require('../validators');

router.put(
  '/accept/:applicationId',
  authenticate([ROLES.EMPLOYER]),
  applicationValidators.reviewApplicationValidator,
  validate,
  ApplicationController.accept,
);

router.put(
  '/reject/:applicationId',
  authenticate([ROLES.EMPLOYER]),
  applicationValidators.reviewApplicationValidator,
  validate,
  ApplicationController.reject,
);

router.get(
  '/:id',
  authenticate([ROLES.STUDENT, ROLES.EMPLOYER]),
  applicationValidators.applicationIdParamValidator,
  validate,
  ApplicationController.getById,
);

module.exports = router;
