const { body } = require('express-validator');
const { GENDERS } = require('../constants');

const updateStudentProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
  body('gender')
    .optional()
    .isIn(Object.values(GENDERS))
    .withMessage(`Gender must be: ${Object.values(GENDERS).join(', ')}`),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('address.city')
    .optional()
    .trim()
    .isString()
    .withMessage('City must be a string'),
  body('address.state')
    .optional()
    .trim()
    .isString()
    .withMessage('State must be a string'),
  body('address.country')
    .optional()
    .trim()
    .isString()
    .withMessage('Country must be a string'),
  body('education.institution')
    .optional()
    .trim()
    .isString()
    .withMessage('Institution must be a string'),
  body('education.degree')
    .optional()
    .trim()
    .isString()
    .withMessage('Degree must be a string'),
  body('education.fieldOfStudy')
    .optional()
    .trim()
    .isString()
    .withMessage('Field of study must be a string'),
  body('education.graduationYear')
    .optional()
    .isInt({ min: 1950, max: 2100 })
    .withMessage('Invalid graduation year'),
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  body('skills.*')
    .optional()
    .trim()
    .isString()
    .withMessage('Each skill must be a string'),
];

const updateEmployerProfileValidator = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be 2-50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be 2-50 characters'),
  body('companyName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be 2-100 characters'),
  body('companyDescription')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must not exceed 2000 characters'),
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Invalid website URL'),
  body('industry')
    .optional()
    .trim()
    .isString()
    .withMessage('Industry must be a string'),
  body('companySize')
    .optional()
    .isIn(['1-10', '11-50', '51-200', '201-500', '500+'])
    .withMessage('Invalid company size'),
  body('location.city')
    .optional()
    .trim()
    .isString()
    .withMessage('City must be a string'),
  body('location.state')
    .optional()
    .trim()
    .isString()
    .withMessage('State must be a string'),
  body('phone')
    .optional()
    .trim()
    .isMobilePhone('any')
    .withMessage('Invalid phone number'),
];

module.exports = {
  updateStudentProfileValidator,
  updateEmployerProfileValidator,
};
