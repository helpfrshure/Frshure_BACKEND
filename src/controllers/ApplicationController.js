const { ApplicationService } = require('../services');
const { sendSuccess } = require('../utils/response');

class ApplicationController {
  async accept(req, res, next) {
    try {
      const { notes } = req.body;
      const application = await ApplicationService.acceptApplication(
        req.userId,
        req.params.applicationId,
        notes,
      );
      return sendSuccess(res, 200, 'Application accepted', application);
    } catch (error) {
      next(error);
    }
  }

  async reject(req, res, next) {
    try {
      const { notes, rejectionReason } = req.body;
      const application = await ApplicationService.rejectApplication(
        req.userId,
        req.params.applicationId,
        rejectionReason || notes,
      );
      return sendSuccess(res, 200, 'Application rejected', application);
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const application = await ApplicationService.getApplication(req.params.id);
      return sendSuccess(res, 200, 'Application retrieved', application);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ApplicationController();
