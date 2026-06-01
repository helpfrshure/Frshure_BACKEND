const { StudentRepository, SavedJobRepository } = require('../repositories');
const { AppError } = require('../middlewares/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

class StudentService {
  async getProfile(studentId) {
    const student = await StudentRepository.findById(studentId);
    if (!student) {
      throw new AppError('Student not found', 404);
    }
    return student;
  }

  async updateProfile(studentId, data, file) {
    const student = await StudentRepository.findById(studentId);
    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const updateData = { ...data };

    if (file) {
      if (student.profilePhotoPublicId) {
        await deleteFromCloudinary(student.profilePhotoPublicId);
      }

      const result = await uploadToCloudinary(file, 'profiles');
      updateData.profilePhoto = result.secure_url;
      updateData.profilePhotoPublicId = result.public_id;
    }

    const updated = await StudentRepository.updateById(studentId, updateData);

    const isComplete = !!(updated.firstName && updated.lastName && updated.email &&
      updated.phone && updated.education.institution && updated.skills.length > 0);

    if (isComplete && !updated.isProfileComplete) {
      await StudentRepository.updateById(studentId, { isProfileComplete: true });
    }

    return updated;
  }

  async getApplications(studentId, options = {}) {
    const { ApplicationRepository } = require('../repositories');
    return ApplicationRepository.findByStudent(studentId, options);
  }

  async getSavedJobs(studentId, options = {}) {
    return SavedJobRepository.findByStudent(studentId, options);
  }

  async saveJob(studentId, jobId) {
    const existing = await SavedJobRepository.findByStudentAndJob(studentId, jobId);
    if (existing) {
      throw new AppError('Job already saved', 409);
    }

    const savedJob = await SavedJobRepository.create({ student: studentId, job: jobId });

    const { JobRepository } = require('../repositories');
    await JobRepository.incrementSavesCount(jobId);

    return savedJob;
  }

  async unsaveJob(studentId, jobId) {
    const existing = await SavedJobRepository.findByStudentAndJob(studentId, jobId);
    if (!existing) {
      throw new AppError('Job not saved', 404);
    }

    await SavedJobRepository.deleteByStudentAndJob(studentId, jobId);

    const { JobRepository } = require('../repositories');
    await JobRepository.decrementSavesCount(jobId);

    return { message: 'Job unsaved successfully' };
  }
}

module.exports = new StudentService();
