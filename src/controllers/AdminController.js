const { AdminService } = require('../services');
const { sendSuccess } = require('../utils/response');

class AdminController {
  async getDashboard(req, res, next) {
    try {
      const dashboard = await AdminService.getDashboard();
      return sendSuccess(res, 200, 'Admin dashboard retrieved', dashboard);
    } catch (error) {
      next(error);
    }
  }

  async getEmployers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await AdminService.getEmployers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });
      return sendSuccess(res, 200, 'Employers retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  async approveEmployer(req, res, next) {
    try {
      const employer = await AdminService.approveEmployer(req.params.id);
      return sendSuccess(res, 200, 'Employer approved', employer);
    } catch (error) {
      next(error);
    }
  }

  async rejectEmployer(req, res, next) {
    try {
      const result = await AdminService.rejectEmployer(req.params.id);
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await AdminService.getUsers({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });
      return sendSuccess(res, 200, 'Users retrieved', result);
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const { role } = req.query;
      const result = await AdminService.deleteUser(req.params.id, role || 'STUDENT');
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const analytics = await AdminService.getAnalytics();
      return sendSuccess(res, 200, 'Analytics retrieved', analytics);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
