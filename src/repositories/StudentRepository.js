const { Student } = require('../models');
const { PAGINATION } = require('../constants');

class StudentRepository {
  async create(data) {
    return Student.create(data);
  }

  async findById(id, select = '') {
    return Student.findById(id).select(select);
  }

  async findByEmail(email) {
    return Student.findOne({ email: email.toLowerCase() });
  }

  async findByEmailWithPassword(email) {
    return Student.findOne({ email: email.toLowerCase() }).select('+password');
  }

  async findByIdWithPassword(id) {
    return Student.findById(id).select('+password +refreshToken');
  }

  async updateById(id, data) {
    return Student.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async findAll(query = {}, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find(query)
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      Student.countDocuments(query),
    ]);

    return {
      data: students,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteById(id) {
    return Student.findByIdAndUpdate(id, { isActive: false });
  }

  async hardDeleteById(id) {
    return Student.findByIdAndDelete(id);
  }

  async updateRefreshToken(id, refreshToken) {
    return Student.findByIdAndUpdate(id, { refreshToken });
  }

  async updateLastLogin(id) {
    return Student.findByIdAndUpdate(id, { lastLogin: new Date() });
  }

  async getSavedJobs(studentId) {
    return Student.findById(studentId).populate({
      path: 'savedJobs',
      match: { status: 'ACTIVE' },
      populate: {
        path: 'employer',
        select: 'companyName companyLogo location',
      },
    });
  }

  async countStudents(query = {}) {
    return Student.countDocuments(query);
  }

  async getActiveStudentsCount() {
    return Student.countDocuments({ isActive: true });
  }

  async getNewStudentsThisMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    return Student.countDocuments({ createdAt: { $gte: startOfMonth } });
  }
}

module.exports = new StudentRepository();
