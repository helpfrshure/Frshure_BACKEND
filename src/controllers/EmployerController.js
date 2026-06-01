const { EmployerService } = require('../services');
const { sendSuccess } = require('../utils/response');

class EmployerController {
  async getProfile(req, res, next) {
    try {
      const employer = await EmployerService.getProfile(req.userId);
      return sendSuccess(res, 200, 'Profile retrieved', employer);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const employer = await EmployerService.updateProfile(
        req.userId,
        req.body,
        req.file,
      );
      return sendSuccess(res, 200, 'Profile updated', employer);
    } catch (error) {
      next(error);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const dashboard = await EmployerService.getDashboard(req.userId);
      return sendSuccess(res, 200, 'Dashboard retrieved', dashboard);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const analytics = await EmployerService.getAnalytics(req.userId);
      return sendSuccess(res, 200, 'Analytics retrieved', analytics);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EmployerController();
