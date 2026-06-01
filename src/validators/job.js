const { body, param, query } = require('express-validator');
const { JOB_TYPES, EXPERIENCE_LEVELS, JOB_STATUS } = require('../constants');

const createJobValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Job title is required')
    .isLength({ min: 5, max: 150 })
    .withMessage('Title must be 5-150 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be 50-5000 characters'),
  body('location.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('jobType')
    .trim()
    .notEmpty()
    .withMessage('Job type is required')
    .isIn(Object.values(JOB_TYPES))
    .withMessage(`Job type must be: ${Object.values(JOB_TYPES).join(', ')}`),
  body('slots')
    .notEmpty()
    .withMessage('Slots are required')
    .isInt({ min: 1 })
    .withMessage('At least 1 slot is required'),
  body('salary.min')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Min salary must be a positive number'),
  body('salary.max')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Max salary must be a positive number'),
  body('experienceLevel')
    .optional()
    .isIn(Object.values(EXPERIENCE_LEVELS))
    .withMessage(`Experience level must be: ${Object.values(EXPERIENCE_LEVELS).join(', ')}`),
  body('deadline')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format for deadline'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('requirements')
    .optional()
    .isArray()
    .withMessage('Requirements must be an array'),
  body('responsibilities')
    .optional()
    .isArray()
    .withMessage('Responsibilities must be an array'),
];

const updateJobValidator = [
  param('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid Job ID format'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 150 })
    .withMessage('Title must be 5-150 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Description must be 50-5000 characters'),
  body('jobType')
    .optional()
    .isIn(Object.values(JOB_TYPES))
    .withMessage(`Job type must be: ${Object.values(JOB_TYPES).join(', ')}`),
  body('slots')
    .optional()
    .isInt({ min: 1 })
    .withMessage('At least 1 slot is required'),
  body('status')
    .optional()
    .isIn(Object.values(JOB_STATUS))
    .withMessage(`Status must be: ${Object.values(JOB_STATUS).join(', ')}`),
  body('experienceLevel')
    .optional()
    .isIn(Object.values(EXPERIENCE_LEVELS))
    .withMessage(`Experience level must be: ${Object.values(EXPERIENCE_LEVELS).join(', ')}`),
];

const jobIdValidator = [
  param('jobId')
    .notEmpty()
    .withMessage('Job ID is required')
    .isMongoId()
    .withMessage('Invalid Job ID format'),
];

const searchJobValidator = [
  query('q')
    .optional()
    .trim()
    .isString()
    .withMessage('Search query must be a string'),
  query('city')
    .optional()
    .trim()
    .isString()
    .withMessage('City must be a string'),
  query('jobType')
    .optional()
    .isIn(Object.values(JOB_TYPES))
    .withMessage(`Job type must be: ${Object.values(JOB_TYPES).join(', ')}`),
  query('experienceLevel')
    .optional()
    .isIn(Object.values(EXPERIENCE_LEVELS))
    .withMessage(`Experience level must be: ${Object.values(EXPERIENCE_LEVELS).join(', ')}`),
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
  createJobValidator,
  updateJobValidator,
  jobIdValidator,
  searchJobValidator,
};
