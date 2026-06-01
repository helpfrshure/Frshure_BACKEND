const mongoose = require('mongoose');
const { JOB_STATUS, JOB_TYPES, EXPERIENCE_LEVELS } = require('../constants');

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: [true, 'Employer is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [150, 'Title must not exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      minlength: [50, 'Description must be at least 50 characters'],
      maxlength: [5000, 'Description must not exceed 5000 characters'],
    },
    requirements: [{
      type: String,
      trim: true,
    }],
    responsibilities: [{
      type: String,
      trim: true,
    }],
    perks: [{
      type: String,
      trim: true,
    }],
    location: {
      address: { type: String, default: '' },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, default: '' },
      country: { type: String, default: 'India' },
      isRemote: { type: Boolean, default: false },
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPES),
      required: [true, 'Job type is required'],
    },
    experienceLevel: {
      type: String,
      enum: Object.values(EXPERIENCE_LEVELS),
      default: EXPERIENCE_LEVELS.ENTRY,
    },
    salary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
      currency: { type: String, default: 'INR' },
      isNegotiable: { type: Boolean, default: false },
      showSalary: { type: Boolean, default: true },
    },
    slots: {
      type: Number,
      required: [true, 'Number of slots is required'],
      min: [1, 'At least 1 slot required'],
    },
    applicationsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.ACTIVE,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    deadline: {
      type: Date,
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    duration: {
      type: String,
      default: null,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    views: {
      type: Number,
      default: 0,
    },
    savesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

jobSchema.virtual('applications', {
  ref: 'Application',
  localField: '_id',
  foreignField: 'job',
});

jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ 'location.city': 1, status: 1 });
jobSchema.index({ jobType: 1, status: 1 });
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ tags: 1 });

module.exports = mongoose.model('Job', jobSchema);
