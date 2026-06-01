const rateLimit = require('express-rate-limit');
const logger = require('../config/logger');

const createRateLimiter = (
  windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  max = parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  message = 'Too many requests. Please try again later.',
) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message,
      timestamp: new Date().toISOString(),
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        path: req.originalUrl,
        method: req.method,
      });
      res.status(options.statusCode).json(options.message);
    },
  });
};

const authLimiter = createRateLimiter(
  900000,
  10,
  'Too many authentication attempts. Try again in 15 minutes.',
);

const apiLimiter = createRateLimiter();

const paymentLimiter = createRateLimiter(
  60000,
  5,
  'Too many payment requests. Try again in 1 minute.',
);

module.exports = {
  createRateLimiter,
  authLimiter,
  apiLimiter,
  paymentLimiter,
};
