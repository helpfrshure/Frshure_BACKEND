const multer = require('multer');
const { UPLOAD } = require('../constants');
const { AppError } = require('./errorHandler');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (UPLOAD.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Invalid file type. Allowed: ${UPLOAD.ALLOWED_MIME_TYPES.join(', ')}`,
        400,
      ),
      false,
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
  },
  fileFilter,
});

const uploadSingle = (fieldName) => upload.single(fieldName);

const uploadMultiple = (fieldName, maxCount = 5) =>
  upload.array(fieldName, maxCount);

const uploadFields = (fields) => upload.fields(fields);

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(
        new AppError(
          `File too large. Maximum size is ${UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB`,
          400,
        ),
      );
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  handleMulterError,
};
