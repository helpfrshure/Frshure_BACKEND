const { Employer } = require('../models');
const { PAGINATION } = require('../constants');

class EmployerRepository {
  async create(data) {
    return Employer.create(data);
  }

  async findById(id, select = '') {
    return Employer.findById(id).select(select);
  }

  async findByEmail(email) {
    return Employer.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email) {
    return Employer.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findByIdWithPassword(id) {
    return Employer.findById(id).select('+password +refreshToken');
  }

  async updateById(id, data) {
    return Employer.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async findAll(query = {}, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [employers, total] = await Promise.all([
      Employer.find(query)
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      Employer.countDocuments(query),
    ]);

    return {
      data: employers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteById(id) {
    return Employer.findByIdAndUpdate(id, { isActive: false });
  }

  async hardDeleteById(id) {
    return Employer.findByIdAndDelete(id);
  }

  async updateApprovalStatus(id, isApproved) {
    return Employer.findByIdAndUpdate(id, { isApproved, isVerified: isApproved }, { new: true });
  }

  async updateRefreshToken(id, refreshToken) {
    return Employer.findByIdAndUpdate(id, { refreshToken });
  }

  async updateLastLogin(id) {
    return Employer.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async countEmployers(query = {}) {
    return Employer.countDocuments(query);
  }

  async getActiveEmployersCount() {
    return Employer.countDocuments({ isActive: true });
  }

  async getApprovedEmployersCount() {
    return Employer.countDocuments({ isApproved: true });
  }

  async getNewEmployersThisMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return Employer.countDocuments({ createdAt: { $gte: startOfMonth } });
  }

  async getPendingApprovals() {
    return Employer.find({ isApproved: false, isActive: true })
      .sort({ createdAt: -1 });
  }

  async getEmployerDashboardStats(id) {
    const employer = await Employer.findById(id)
      .select('companyName companyLogo isVerified isApproved');

    return employer;
  }
}

module.exports = new EmployerRepository();
