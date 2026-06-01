const { body, param } = require('express-validator');

const applyJobValidator = [
  param('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid Job ID format'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter must not exceed 2000 characters'),
];

const applicationIdValidator = [
  param('applicationId')
    .notEmpty()
    .withMessage('Application ID is required')
    .isMongoId()
    .withMessage('Invalid Application ID format'),
];

const applicationIdParamValidator = [
  param('id')
    .notEmpty()
    .withMessage('Application ID is required')
    .isMongoId()
    .withMessage('Invalid Application ID format'),
];

const reviewApplicationValidator = [
  param('applicationId')
    .notEmpty()
    .withMessage('Application ID is required')
    .isMongoId()
    .withMessage('Invalid Application ID format'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason must not exceed 500 characters'),
];

module.exports = {
  applyJobValidator,
  applicationIdValidator,
  applicationIdParamValidator,
  reviewApplicationValidator,
};
