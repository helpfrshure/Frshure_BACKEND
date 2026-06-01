const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employer',
      required: [true, 'Employer is required'],
    },
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      default: null,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating must not exceed 5'],
    },
    review: {
      type: String,
      default: '',
      maxlength: [1000, 'Review must not exceed 1000 characters'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

ratingSchema.index({ student: 1, employer: 1 }, { unique: true });
ratingSchema.index({ employer: 1, rating: -1 });
ratingSchema.index({ job: 1 });

module.exports = mongoose.model('Rating', ratingSchema);
