const crypto = require('crypto');
const { PaymentRepository, JobRepository, EmployerRepository } = require('../repositories');
const { getRazorpay } = require('../config/razorpay');
const { AppError } = require('../middlewares/errorHandler');
const { PAYMENT_STATUS, JOB_STATUS, JOB_POSTING_FEE, CURRENCY } = require('../constants');
const logger = require('../config/logger');

class PaymentService {
  async createOrder(employerId, jobId) {
    const employer = await EmployerRepository.findById(employerId);
    if (!employer) {
      throw new AppError('Employer not found', 404);
    }

    const job = await JobRepository.findById(jobId);
    if (!job) {
      throw new AppError('Job not found', 404);
    }

    if (job.employer._id.toString() !== employerId) {
      throw new AppError('Unauthorized to make payment for this job', 403);
    }

    if (job.isPaid) {
      throw new AppError('Job already paid and active', 400);
    }

    const razorpay = getRazorpay();

    const idempotencyKey = `${employerId}_${jobId}_${Date.now()}`;

    const existingPayment = await PaymentRepository.findByIdempotencyKey(idempotencyKey);
    if (existingPayment) {
      throw new AppError('Duplicate payment request', 409);
    }

    const amountInPaise = JOB_POSTING_FEE * 100;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: CURRENCY,
      receipt: `job_${jobId}_${Date.now()}`,
      notes: {
        employerId,
        jobId,
      },
    });

    const payment = await PaymentRepository.create({
      employer: employerId,
      job: jobId,
      razorpayOrderId: order.id,
      amount: JOB_POSTING_FEE,
      currency: CURRENCY,
      status: PAYMENT_STATUS.PENDING,
      purpose: 'JOB_POSTING',
      idempotencyKey,
    });

    logger.info(`Payment order created: ${order.id} for job ${jobId}`);

    return {
      orderId: payment._id,
      razorpayOrderId: order.id,
      amount: JOB_POSTING_FEE,
      currency: CURRENCY,
      key: process.env.RAZORPAY_KEY_ID,
      notes: {
        employerId,
        jobId,
      },
    };
  }

  async verifyPayment(data) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = data;

    const payment = await PaymentRepository.findById(orderId);
    if (!payment) {
      throw new AppError('Payment record not found', 404);
    }

    if (payment.status === PAYMENT_STATUS.PAID) {
      throw new AppError('Payment already verified', 400);
    }

    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      await PaymentRepository.markAsFailed(razorpay_order_id);
      throw new AppError('Invalid payment signature', 400);
    }

    await PaymentRepository.markAsPaid(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    const updatedPayment = await PaymentRepository.findByRazorpayOrderId(razorpay_order_id);

    await JobRepository.markAsPaid(payment.job, updatedPayment._id);

    logger.info(`Payment verified: ${razorpay_payment_id} for job ${payment.job}`);

    const { NotificationService } = require('./NotificationService');
    await NotificationService.sendPaymentSuccess(
      payment.employer,
      payment.job,
    );

    return { message: 'Payment verified successfully. Job is now active.' };
  }

  async handleWebhook(event) {
    try {
      const razorpay = getRazorpay();

      const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET);
      shasum.update(JSON.stringify(event));
      const digest = shasum.digest('hex');

      if (digest !== event.headers['x-razorpay-signature']) {
        logger.warn('Invalid webhook signature');
        return { status: 'invalid_signature' };
      }

      const { event: eventType, payload } = event;

      switch (eventType) {
        case 'payment.captured':
          await this.handlePaymentCaptured(payload);
          break;
        case 'payment.failed':
          await this.handlePaymentFailed(payload);
          break;
        default:
          logger.info(`Unhandled webhook event: ${eventType}`);
      }

      return { status: 'processed' };
    } catch (error) {
      logger.error('Webhook processing failed', { error: error.message });
      return { status: 'error', message: error.message };
    }
  }

  async handlePaymentCaptured(payload) {
    const { payment, order } = payload;
    const paymentRecord = await PaymentRepository.findByRazorpayOrderId(order.entity.id);

    if (paymentRecord && paymentRecord.status !== PAYMENT_STATUS.PAID) {
      await PaymentRepository.markAsPaid(
        order.entity.id,
        payment.entity.id,
        payment.entity.signature || 'webhook_verified',
      );

      if (paymentRecord.job) {
        await JobRepository.markAsPaid(paymentRecord.job, paymentRecord._id);
      }

      logger.info(`Webhook: Payment captured ${payment.entity.id}`);
    }
  }

  async handlePaymentFailed(payload) {
    const { order } = payload;
    await PaymentRepository.markAsFailed(order.entity.id);
    logger.warn(`Webhook: Payment failed for order ${order.entity.id}`);
  }

  async getPaymentHistory(employerId, options = {}) {
    return PaymentRepository.findByEmployer(employerId, options);
  }
}

module.exports = new PaymentService();
