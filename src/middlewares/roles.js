const { sendError } = require('../utils/response');

const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.userRole) {
      return sendError(res, 401, 'Authentication required.');
    }

    if (!allowedRoles.includes(req.userRole)) {
      return sendError(
        res,
        403,
        `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      );
    }

    next();
  };
};

module.exports = authorize;
