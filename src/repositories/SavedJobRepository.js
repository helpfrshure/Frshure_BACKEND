const { SavedJob } = require('../models');
const { PAGINATION } = require('../constants');

class SavedJobRepository {
  async create(data) {
    return SavedJob.create(data);
  }

  async findByStudentAndJob(studentId, jobId) {
    return SavedJob.findOne({ student: studentId, job: jobId });
  }

  async deleteById(id) {
    return SavedJob.findByIdAndDelete(id);
  }

  async deleteByStudentAndJob(studentId, jobId) {
    return SavedJob.findOneAndDelete({ student: studentId, job: jobId });
  }

  async findByStudent(studentId, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { student: studentId };

    const [savedJobs, total] = await Promise.all([
      SavedJob.find(filter)
        .populate({
          path: 'job',
          populate: {
            path: 'employer',
            select: 'companyName companyLogo location city industry',
          },
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      SavedJob.countDocuments(filter),
    ]);

    return {
      data: savedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async countByStudent(studentId) {
    return SavedJob.countDocuments({ student: studentId });
  }

  async countByJob(jobId) {
    return SavedJob.countDocuments({ job: jobId });
  }

  async isSaved(studentId, jobId) {
    const saved = await SavedJob.findOne({ student: studentId, job: jobId });
    return !!saved;
  }
}

module.exports = new SavedJobRepository();
