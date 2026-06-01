const { Job } = require('../models');
const { PAGINATION, JOB_STATUS } = require('../constants');

class JobRepository {
  async create(data) {
    return Job.create(data);
  }

  async findById(id) {
    return Job.findById(id)
      .populate('employer', 'companyName companyLogo location city industry')
      .populate('payment');
  }

  async updateById(id, data) {
    return Job.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id) {
    return Job.findByIdAndDelete(id);
  }

  async findAll(query = {}, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { ...query };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('employer', 'companyName companyLogo location city industry')
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      Job.countDocuments(filter),
    ]);

    return {
      data: jobs,
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

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      Job.countDocuments(filter),
    ]);

    return {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async search(query, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { status: JOB_STATUS.ACTIVE };

    if (query.q) {
      filter.$text = { $search: query.q };
    }

    if (query.city) {
      filter['location.city'] = { $regex: query.city, $options: 'i' };
    }

    if (query.jobType) {
      filter.jobType = query.jobType;
    }

    if (query.experienceLevel) {
      filter.experienceLevel = query.experienceLevel;
    }

    if (query.skills) {
      const skillsArray = query.skills.split(',');
      filter.skills = { $in: skillsArray };
    }

    if (query.salaryMin) {
      filter['salary.max'] = { $gte: parseInt(query.salaryMin, 10) };
    }

    if (query.salaryMax) {
      filter['salary.min'] = { $lte: parseInt(query.salaryMax, 10) };
    }

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('employer', 'companyName companyLogo location city industry')
        .skip(skip)
        .limit(limit)
        .sort(options.sort || { createdAt: -1 }),
      Job.countDocuments(filter),
    ]);

    return {
      data: jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async incrementApplicationsCount(jobId) {
    return Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });
  }

  async decrementApplicationsCount(jobId) {
    return Job.findByIdAndUpdate(
      jobId,
      { $inc: { applicationsCount: -1 } },
      { new: true },
    );
  }

  async incrementViews(jobId) {
    return Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });
  }

  async incrementSavesCount(jobId) {
    return Job.findByIdAndUpdate(jobId, { $inc: { savesCount: 1 } });
  }

  async decrementSavesCount(jobId) {
    return Job.findByIdAndUpdate(
      jobId,
      { $inc: { savesCount: -1 } },
      { new: true },
    );
  }

  async markAsPaid(jobId, paymentId) {
    return Job.findByIdAndUpdate(jobId, {
      isPaid: true,
      payment: paymentId,
      status: JOB_STATUS.ACTIVE,
    }, { new: true });
  }

  async countJobs(query = {}) {
    return Job.countDocuments(query);
  }

  async getActiveJobsCount() {
    return Job.countDocuments({ status: JOB_STATUS.ACTIVE });
  }

  async getRecentJobs(days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return Job.countDocuments({ createdAt: { $gte: since } });
  }

  async findActiveFeatured(options = {}) {
    return this.findAll(
      { status: JOB_STATUS.ACTIVE, isPaid: true },
      { ...options, sort: { createdAt: -1 } },
    );
  }

  async getEmployerJobStats(employerId) {
    const [total, active, filled, cancelled] = await Promise.all([
      Job.countDocuments({ employer: employerId }),
      Job.countDocuments({ employer: employerId, status: JOB_STATUS.ACTIVE }),
      Job.countDocuments({ employer: employerId, status: JOB_STATUS.FILLED }),
      Job.countDocuments({ employer: employerId, status: JOB_STATUS.CANCELLED }),
    ]);

    return { total, active, filled, cancelled };
  }
}

module.exports = new JobRepository();
