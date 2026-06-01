const { PaymentService } = require('../services');
const { sendSuccess } = require('../utils/response');

class PaymentController {
  async createOrder(req, res, next) {
    try {
      const { jobId } = req.body;
      const order = await PaymentService.createOrder(req.userId, jobId);
      return sendSuccess(res, 201, 'Payment order created', order);
    } catch (error) {
      next(error);
    }
  }

  async verify(req, res, next) {
    try {
      const result = await PaymentService.verifyPayment(req.body);
      return sendSuccess(res, 200, result.message);
    } catch (error) {
      next(error);
    }
  }

  async webhook(req, res, next) {
    try {
      const result = await PaymentService.handleWebhook(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(200).json({ status: 'error', message: error.message });
    }
  }
}

module.exports = new PaymentController();
