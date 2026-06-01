const { JobRepository, ApplicationRepository, EmployerRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');
const { JOB_POSTING_FEE, JOB_STATUS } = require('../constants');
const logger = require('../config/logger');

class JobService {
  async createJob(employerId, data) {
    const employer = await EmployerRepository.findById(employerId);
    if (!employer) {
      throw new AppError('Employer not found', 404);
    }

    if (!employer.isApproved) {
      throw new AppError('Account pending approval. Cannot post jobs.', 403);
    }

    const job = await JobRepository.create({
      ...data,
      employer: employerId,
      status: JOB_STATUS.INACTIVE,
      isPaid: false,
    });

    logger.info(`Job created: ${job.title} by employer ${employerId}`);

    return {
      job,
      requiresPayment: true,
      paymentAmount: JOB_POSTING_FEE,
      message: 'Job created. Payment required to activate.',
    };
  }

  async getJob(jobId) {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    await JobRepository.incrementViews(jobId);

    return job;
  }

  async updateJob(employerId, jobId, data) {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employer._id.toString() !== employerId) {
      throw new AppError('Unauthorized to update this job', 403);
    }

    const updated = await JobRepository.updateById(jobId, data);
    return updated;
  }

  async deleteJob(employerId, jobId) {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employer._id.toString() !== employerId) {
      throw new AppError('Unauthorized to delete this job', 403);
    }

    await JobRepository.deleteById(jobId);
    logger.info(`Job deleted: ${jobId}`);

    return { message: 'Job deleted successfully' };
  }

  async listJobs(options = {}) {
    const filter = { status: JOB_STATUS.ACTIVE };
    return JobRepository.findAll(filter, options);
  }

  async searchJobs(query, options = {}) {
    return JobRepository.search(query, options);
  }

  async filterJobs(filters, options = {}) {
    const query = { status: JOB_STATUS.ACTIVE };

    if (filters.jobType) query.jobType = filters.jobType;
    if (filters.city) query['location.city'] = { $regex: filters.city, $options: 'i' };
    if (filters.experienceLevel) query.experienceLevel = filters.experienceLevel;
    if (filters.isRemote) query['location.isRemote'] = filters.isRemote === 'true';
    if (filters.skills) {
      const skillsArray = filters.skills.split(',');
      query.skills = { $in: skillsArray };
    }
    if (filters.salaryMin) {
      query['salary.max'] = { $gte: parseInt(filters.salaryMin, 10) };
    }
    if (filters.employer) query.employer = filters.employer;

    return JobRepository.findAll(query, options);
  }

  async applyForJob(studentId, jobId, data) {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.status !== JOB_STATUS.ACTIVE) {
      throw new AppError('This job is no longer accepting applications', 400);
    }

    const hasApplied = await ApplicationRepository.hasApplied(studentId, jobId);
    if (hasApplied) {
      throw new AppError('You have already applied for this job', 409);
    }

    if (job.applicationsCount >= job.slots) {
      throw new AppError('All slots for this job are filled', 400);
    }

    const application = await ApplicationRepository.create({
      student: studentId,
      job: jobId,
      employer: job.employer._id || job.employer,
      coverLetter: data.coverLetter || '',
    });

    await JobRepository.incrementApplicationsCount(jobId);

    logger.info(`Student ${studentId} applied for job ${jobId}`);

    return application;
  }

  async getApplicants(employerId, jobId, options = {}) {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employer._id.toString() !== employerId) {
      throw new AppError('Unauthorized to view applicants', 403);
    }

    return ApplicationRepository.findByJob(jobId, options);
  }

  async getEmployerJobs(employerId, options = {}) {
    return JobRepository.findByEmployer(employerId, options);
  }

  async getJobStats(jobId) {
    const stats = await ApplicationRepository.getApplicationStats(jobId);
    return stats;
  }
}

module.exports = new JobService();
