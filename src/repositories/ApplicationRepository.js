const { Application } = require('../models');
const { PAGINATION, APPLICATION_STATUS } = require('../constants');

class ApplicationRepository {
  async create(data) {
    return Application.create(data);
  }

  async findById(id) {
    return Application.findById(id)
      .populate('student', 'firstName lastName email phone profilePhoto skills education')
      .populate('job')
      .populate('employer', 'companyName companyLogo');
  }

  async updateById(id, data) {
    return Application.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async findByStudentAndJob(studentId, jobId) {
    return Application.findOne({ student: studentId, job: jobId });
  }

  async findByStudent(studentId, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { student: studentId };
    if (options.status) filter.status = options.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'job',
          populate: { path: 'employer', select: 'companyName companyLogo location city' },
        })
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      Application.countDocuments(filter),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByJob(jobId, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { job: jobId };
    if (options.status) filter.status = options.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('student', 'firstName lastName email phone profilePhoto skills education resume')
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      Application.countDocuments(filter),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findByEmployer(employerId, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { employer: employerId };
    if (options.status) filter.status = options.status;

    const [applications, total] = await Promise.all([
      Application.find(filter)
        .populate('student', 'firstName lastName email phone profilePhoto skills')
        .populate('job', 'title location city')
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      Application.countDocuments(filter),
    ]);

    return {
      data: applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async acceptApplication(id, employerId) {
    return Application.findByIdAndUpdate(
      id,
      {
        status: APPLICATION_STATUS.ACCEPTED,
        reviewedAt: new Date(),
        reviewedBy: employerId,
      },
      { new: true },
    );
  }

  async rejectApplication(id, employerId, reason = '') {
    return Application.findByIdAndUpdate(
      id,
      {
        status: APPLICATION_STATUS.REJECTED,
        reviewedAt: new Date(),
        reviewedBy: employerId,
        rejectionReason: reason || 'Not selected for this position',
      },
      { new: true },
    );
  }

  async withdrawApplication(id) {
    return Application.findByIdAndUpdate(
      id,
      {
        status: APPLICATION_STATUS.WITHDRAWN,
        isWithdrawn: true,
        withdrawnAt: new Date(),
      },
      { new: true },
    );
  }

  async countByJob(jobId) {
    return Application.countDocuments({ job: jobId });
  }

  async countByJobAndStatus(jobId, status) {
    return Application.countDocuments({ job: jobId, status });
  }

  async countByStudent(studentId) {
    return Application.countDocuments({ student: studentId });
  }

  async countByEmployer(employerId) {
    return Application.countDocuments({ employer: employerId });
  }

  async getApplicationStats(jobId) {
    const stats = await Application.aggregate([
      { $match: { job: jobId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const result = { total: 0 };
    stats.forEach((s) => {
      result[s._id.toLowerCase()] = s.count;
      result.total += s.count;
    });

    return result;
  }

  async hasApplied(studentId, jobId) {
    const application = await Application.findOne({
      student: studentId,
      job: jobId,
      isWithdrawn: { $ne: true },
    });
    return !!application;
  }
}

module.exports = new ApplicationRepository();
