const { StudentService } = require('../services');
const { sendSuccess } = require('../utils/response');

class StudentController {
  async getProfile(req, res, next) {
    try {
      const student = await StudentService.getProfile(req.userId);
      return sendSuccess(res, 200, 'Profile retrieved', student);
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const student = await StudentService.updateProfile(
        req.userId,
        req.body,
        req.file,
      );
      return sendSuccess(res, 200, 'Profile updated', student);
    } catch (error) {
      next(error);
    }
  }

  async getApplications(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await StudentService.getApplications(req.userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
      });
      return sendSuccess(res, 200, 'Applications retrieved', result.data);
    } catch (error) {
      next(error);
    }
  }

  async getSavedJobs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await StudentService.getSavedJobs(req.userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });
      return sendSuccess(res, 200, 'Saved jobs retrieved', result.data);
    } catch (error) {
      next(error);
    }
  }

  async saveJob(req, res, next) {
    try {
      const result = await StudentService.saveJob(req.userId, req.params.jobId);
      return sendSuccess(res, 201, 'Job saved', result);
    } catch (error) {
      next(error);
    }
  }

  async unsaveJob(req, res, next) {
    try {
      const result = await StudentService.unsaveJob(req.userId, req.params.jobId);
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();
