const mongoose = require('mongoose');
const { APPLICATION_STATUS } = require('../constants');

const applicationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job is required'],
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: [true, 'Employer is required'],
    },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.PENDING,
    },
    coverLetter: {
      type: String,
      maxlength: [2000, 'Cover letter must not exceed 2000 characters'],
      default: '',
    },
    resumeUrl: {
      type: String,
      default: null,
    },
    answers: [{
      question: { type: String },
      answer: { type: String },
    }],
    notes: {
      type: String,
      default: '',
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    isWithdrawn: {
      type: Boolean,
      default: false,
    },
    withdrawnAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

applicationSchema.index({ student: 1, job: 1 });
applicationSchema.index({ job: 1, status: 1 });
applicationSchema.index({ employer: 1, status: 1 });
applicationSchema.index({ student: 1, status: 1 });

applicationSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === APPLICATION_STATUS.REJECTED) {
    this.rejectionReason = this.rejectionReason || 'Not specified';
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
