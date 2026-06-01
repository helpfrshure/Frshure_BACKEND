const {
  StudentRepository,
  EmployerRepository,
  JobRepository,
  PaymentRepository,
} = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

class AdminService {
  async getDashboard() {
    const [
      totalStudents,
      totalEmployers,
      totalJobs,
      activeJobs,
      totalApplications,
      pendingApprovals,
      revenueData,
    ] = await Promise.all([
      StudentRepository.countStudents({ isActive: true }),
      EmployerRepository.countEmployers({ isActive: true }),
      JobRepository.countJobs(),
      JobRepository.getActiveJobsCount(),
      0,
      EmployerRepository.getPendingApprovals(),
      PaymentRepository.getTotalRevenue(),
    ]);

    const students = await StudentRepository.findAll({}, { limit: 1 });
    const appsCount = students.data.length > 0
      ? 0
      : 0;

    return {
      stats: {
        totalStudents,
        totalEmployers,
        totalJobs,
        activeJobs,
        totalApplications: appsCount,
        pendingApprovals: pendingApprovals.length,
        totalRevenue: revenueData.total,
        totalRevenueCount: revenueData.count,
      },
      pendingApprovals,
    };
  }

  async getEmployers(options = {}) {
    return EmployerRepository.findAll({}, options);
  }

  async approveEmployer(employerId) {
    const employer = await EmployerRepository.findById(employerId);
    if (!employer) {
      throw new AppError('Employer not found', 404);
    }

    if (employer.isApproved) {
      throw new AppError('Employer already approved', 400);
    }

    const updated = await EmployerRepository.updateApprovalStatus(employerId, true);

    logger.info(`Employer approved: ${employerId}`);

    const { NotificationService } = require('./NotificationService');
    await NotificationService.sendEmployerApproved(employerId);

    return updated;
  }

  async rejectEmployer(employerId) {
    const employer = await EmployerRepository.findById(employerId);
    if (!employer) {
      throw new AppError('Employer not found', 404);
    }

    if (employer.isApproved) {
      throw new AppError('Employer is already approved. Cannot reject.', 400);
    }

    await EmployerRepository.deleteById(employerId);

    logger.info(`Employer rejected: ${employerId}`);

    return { message: 'Employer rejected and deactivated' };
  }

  async getUsers(options = {}) {
    const students = await StudentRepository.findAll({}, options);
    return students;
  }

  async deleteUser(userId, role) {
    if (role === 'STUDENT') {
      const student = await StudentRepository.findById(userId);
      if (!student) {
        throw new AppError('Student not found', 404);
      }
      await StudentRepository.hardDeleteById(userId);
    } else if (role === 'EMPLOYER') {
      const employer = await EmployerRepository.findById(userId);
      if (!employer) {
        throw new AppError('Employer not found', 404);
      }
      await EmployerRepository.hardDeleteById(userId);
    } else {
      throw new AppError('Invalid user role', 400);
    }

    logger.info(`User deleted: ${userId} (${role})`);

    return { message: 'User deleted successfully' };
  }

  async getAnalytics() {
    const [
      totalStudents,
      totalEmployers,
      approvedEmployers,
      totalJobs,
      activeJobs,
      newStudentsThisMonth,
      newEmployersThisMonth,
      revenueThisMonth,
      totalRevenue,
    ] = await Promise.all([
      StudentRepository.countStudents(),
      EmployerRepository.countEmployers(),
      EmployerRepository.getApprovedEmployersCount(),
      JobRepository.countJobs(),
      JobRepository.getActiveJobsCount(),
      StudentRepository.getNewStudentsThisMonth(),
      EmployerRepository.getNewEmployersThisMonth(),
      PaymentRepository.getRevenueThisMonth(),
      PaymentRepository.getTotalRevenue(),
    ]);

    return {
      users: {
        totalStudents,
        totalEmployers,
        approvedEmployers,
        totalUsers: totalStudents + totalEmployers,
        newStudentsThisMonth,
        newEmployersThisMonth,
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        fillRate: totalJobs > 0 ? ((activeJobs / totalJobs) * 100).toFixed(1) : 0,
      },
      revenue: {
        total: totalRevenue.total,
        totalCount: totalRevenue.count,
        thisMonth: revenueThisMonth.total,
        thisMonthCount: revenueThisMonth.count,
      },
    };
  }
}

module.exports = new AdminService();
