const { EmployerRepository, JobRepository, ApplicationRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

class EmployerService {
  async getProfile(employerId) {
    const employer = await EmployerRepository.findById(employerId);
    if (!employer) {
      throw new AppError('Employer not found', 404);
    }
    return employer;
  }

  async updateProfile(employerId, data, file) {
    const employer = await EmployerRepository.findById(employerId);
    if (!employer) {
      throw new AppError('Employer not found', 404);
    }

    const updateData = { ...data };

    if (file) {
      if (employer.companyLogo?.publicId) {
        await deleteFromCloudinary(employer.companyLogo.publicId);
      }

      const result = await uploadToCloudinary(file, 'logos');
      updateData.companyLogo = {
        url: result.secure_url,
        publicId: result.public_id,
      };
    }

    const updated = await EmployerRepository.updateById(employerId, updateData);

    const isComplete = !!(updated.firstName && updated.lastName && updated.companyName &&
      updated.phone && updated.location.city && updated.industry);

    if (isComplete && !updated.isProfileComplete) {
      await EmployerRepository.updateById(employerId, { isProfileComplete: true });
    }

    return updated;
  }

  async getDashboard(employerId) {
    const employer = await EmployerRepository.getEmployerDashboardStats(employerId);
    const jobStats = await JobRepository.getEmployerJobStats(employerId);
    const applications = await ApplicationRepository.countByEmployer(employerId);

    return {
      employer,
      jobs: jobStats,
      totalApplications: applications,
    };
  }

  async getAnalytics(employerId) {
    const jobs = await JobRepository.findByEmployer(employerId);

    const totalJobs = jobs.data.length;
    const totalApplications = await ApplicationRepository.countByEmployer(employerId);

    const jobIds = jobs.data.map((j) => j._id);

    const applicationStats = await Promise.all(
      jobIds.map(async (jobId) => {
        const stats = await ApplicationRepository.getApplicationStats(jobId);
        return { jobId, ...stats };
      }),
    );

    let totalViews = 0;
    jobs.data.forEach((job) => {
      totalViews += job.views || 0;
    });

    return {
      totalJobs,
      totalApplications,
      totalViews,
      averageApplicationsPerJob: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0,
      applicationStats,
      recentJobs: jobs.data.slice(0, 5),
    };
  }
}

module.exports = new EmployerService();
