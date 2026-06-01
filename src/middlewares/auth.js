const { verifyAccessToken } = require('../utils/token');
const { sendError } = require('../utils/response');
const { Student, Employer, Admin } = require('../models');

const authenticate = (requiredRoles = []) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendError(res, 401, 'Access denied. No token provided.');
      }

      const token = authHeader.split(' ')[1];

      if (!token) {
        return sendError(res, 401, 'Access denied. No token provided.');
      }

      let decoded;
      try {
        decoded = verifyAccessToken(token);
      } catch (error) {
        if (error.name === 'TokenExpiredError') {
          return sendError(res, 401, 'Token expired. Please refresh your token.');
        }
        return sendError(res, 401, 'Invalid token.');
      }

      const { id, role } = decoded;

      if (!id || !role) {
        return sendError(res, 401, 'Invalid token payload.');
      }

      let user = null;

      switch (role) {
        case 'STUDENT':
          user = await Student.findById(id).select('-password -refreshToken');
          break;
        case 'EMPLOYER':
          user = await Employer.findById(id).select('-password -refreshToken');
          break;
        case 'ADMIN':
          user = await Admin.findById(id).select('-password -refreshToken');
          break;
        default:
          return sendError(res, 401, 'Invalid role in token.');
      }

      if (!user) {
        return sendError(res, 401, 'User not found. Token may be invalid.');
      }

      if (!user.isActive) {
        return sendError(res, 403, 'Account deactivated. Contact support.');
      }

      if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
        return sendError(
          res,
          403,
          `Access denied. Required role: ${requiredRoles.join(' or ')}`,
        );
      }

      req.user = user;
      req.userId = user._id.toString();
      req.userRole = role;

      next();
    } catch (error) {
      return sendError(res, 500, 'Authentication error.');
    }
  };
};

module.exports = authenticate;
