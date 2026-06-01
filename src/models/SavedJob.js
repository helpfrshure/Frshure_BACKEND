const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

savedJobSchema.index({ student: 1, job: 1 }, { unique: true });
savedJobSchema.index({ student: 1, createdAt: -1 });

module.exports = mongoose.model('SavedJob', savedJobSchema);
