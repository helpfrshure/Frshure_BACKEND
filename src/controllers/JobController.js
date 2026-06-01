const { JobService } = require('../services');
const { sendSuccess } = require('../utils/response');

class JobController {
  async create(req, res, next) {
    try {
      const result = await JobService.createJob(req.userId, req.body);
      return sendSuccess(res, 201, 'Job created', result);
    } catch (error) {
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const { page, limit, sort } = req.query;
      const result = await JobService.listJobs({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        sort,
      });
      return sendSuccess(res, 200, 'Jobs retrieved', {
        jobs: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const job = await JobService.getJob(req.params.jobId);
      return sendSuccess(res, 200, 'Job retrieved', job);
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const job = await JobService.updateJob(req.userId, req.params.jobId, req.body);
      return sendSuccess(res, 200, 'Job updated', job);
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const result = await JobService.deleteJob(req.userId, req.params.jobId);
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { page, limit, q, city, jobType, experienceLevel, skills, salaryMin, salaryMax } = req.query;
      const result = await JobService.searchJobs(
        { q, city, jobType, experienceLevel, skills, salaryMin, salaryMax },
        {
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
        },
      );
      return sendSuccess(res, 200, 'Search results', {
        jobs: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async filter(req, res, next) {
    try {
      const { page, limit, ...filters } = req.query;
      const result = await JobService.filterJobs(filters, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
      });
      return sendSuccess(res, 200, 'Filtered jobs', {
        jobs: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async apply(req, res, next) {
    try {
      const application = await JobService.applyForJob(
        req.userId,
        req.params.jobId,
        req.body,
      );
      return sendSuccess(res, 201, 'Application submitted', application);
    } catch (error) {
      next(error);
    }
  }

  async getApplicants(req, res, next) {
    try {
      const { page, limit, status } = req.query;
      const result = await JobService.getApplicants(req.userId, req.params.jobId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10,
        status,
      });
      return sendSuccess(res, 200, 'Applicants retrieved', {
        applicants: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new JobController();
