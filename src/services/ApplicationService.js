const { ApplicationRepository, JobRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');
const { APPLICATION_STATUS, NOTIFICATION_TYPES } = require('../constants');
const logger = require('../config/logger');

class ApplicationService {
  async getApplication(applicationId) {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404);
    }
    return application;
  }

  async acceptApplication(employerId, applicationId, notes = '') {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const job = await JobRepository.findById(application.job._id || application.job);
    if (!job) {
      throw new AppError('Associated job not found', 404);
    }

    if (job.employer._id.toString() !== employerId) {
      throw new AppError('Unauthorized to review this application', 403);
    }

    if (application.status !== APPLICATION_STATUS.PENDING &&
        application.status !== APPLICATION_STATUS.REVIEWING) {
      throw new AppError('Application already processed', 400);
    }

    const updated = await ApplicationRepository.acceptApplication(applicationId, employerId);

    const { NotificationService } = require('./NotificationService');
    await NotificationService.sendApplicationAccepted(
      application.student._id || application.student,
      application.job._id || application.job,
      job.title,
    );

    logger.info(`Application ${applicationId} accepted`);

    return updated;
  }

  async rejectApplication(employerId, applicationId, reason = '') {
    const application = await ApplicationRepository.findById(applicationId);
    if (!application) {
      throw new AppError('Application not found', 404);
    }

    const job = await JobRepository.findById(application.job._id || application.job);
    if (!job) {
      throw new AppError('Associated job not found', 404);
    }

    if (job.employer._id.toString() !== employerId) {
      throw new AppError('Unauthorized to review this application', 403);
    }

    if (application.status !== APPLICATION_STATUS.PENDING &&
        application.status !== APPLICATION_STATUS.REVIEWING) {
      throw new AppError('Application already processed', 400);
    }

    const updated = await ApplicationRepository.rejectApplication(
      applicationId,
      employerId,
      reason,
    );

    const { NotificationService } = require('./NotificationService');
    await NotificationService.sendApplicationRejected(
      application.student._id || application.student,
      application.job._id || application.job,
      job.title,
    );

    logger.info(`Application ${applicationId} rejected`);

    return updated;
  }

  async getApplicationsForJob(employerId, jobId, options = {}) {
    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employer._id.toString() !== employerId) {
      throw new AppError('Unauthorized to view applications', 403);
    }

    return ApplicationRepository.findByJob(jobId, options);
  }
}

module.exports = new ApplicationService();
