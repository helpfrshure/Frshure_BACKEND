const { AuthService } = require('../services');
const { sendSuccess, sendError } = require('../utils/response');

class AuthController {
  async studentSignup(req, res, next) {
    try {
      const result = await AuthService.studentSignup(req.body);
      return sendSuccess(res, 201, 'Student registered successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async studentLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.studentLogin(email, password);
      return sendSuccess(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async employerSignup(req, res, next) {
    try {
      const result = await AuthService.employerSignup(req.body);
      return sendSuccess(res, 201, 'Employer registered successfully. Awaiting approval.', result);
    } catch (error) {
      next(error);
    }
  }

  async employerLogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.employerLogin(email, password);
      return sendSuccess(res, 200, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await AuthService.logout(req.userId, req.userRole);
      return sendSuccess(res, 200, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      return sendSuccess(res, 200, 'Token refreshed successfully', tokens);
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(
        req.userId,
        req.userRole,
        currentPassword,
        newPassword,
      );
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
