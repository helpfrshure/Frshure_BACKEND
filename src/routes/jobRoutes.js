const express = require('express');
const router = express.Router();
const JobController = require('../controllers/JobController');
const authenticate = require('../middlewares/auth');
const { ROLES } = require('../constants');
const { jobValidators, applicationValidators, validate } = require('../validators');

router.post(
  '/create',
  authenticate([ROLES.EMPLOYER]),
  jobValidators.createJobValidator,
  validate,
  JobController.create,
);

router.get(
  '/',
  JobController.getAll,
);

router.get(
  '/search',
  jobValidators.searchJobValidator,
  validate,
  JobController.search,
);

router.get(
  '/filter',
  JobController.filter,
);

router.get(
  '/:jobId',
  jobValidators.jobIdValidator,
  validate,
  JobController.getById,
);

router.put(
  '/update/:jobId',
  authenticate([ROLES.EMPLOYER]),
  jobValidators.updateJobValidator,
  validate,
  JobController.update,
);

router.delete(
  '/delete/:jobId',
  authenticate([ROLES.EMPLOYER]),
  jobValidators.jobIdValidator,
  validate,
  JobController.delete,
);

router.post(
  '/apply/:jobId',
  authenticate([ROLES.STUDENT]),
  applicationValidators.applyJobValidator,
  validate,
  JobController.apply,
);

router.get(
  '/applicants/:jobId',
  authenticate([ROLES.EMPLOYER]),
  jobValidators.jobIdValidator,
  validate,
  JobController.getApplicants,
);

module.exports = router;
