const { Payment } = require('../models');
const { PAGINATION, PAYMENT_STATUS } = require('../constants');

class PaymentRepository {
  async create(data) {
    return Payment.create(data);
  }

  async findById(id) {
    return Payment.findById(id)
      .populate('employer', 'companyName email firstName lastName')
      .populate('job', 'title');
  }

  async findByRazorpayOrderId(orderId) {
    return Payment.findOne({ razorpayOrderId: orderId });
  }

  async findByEmployer(employerId, options = {}) {
    const page = options.page || PAGINATION.DEFAULT_PAGE;
    const limit = Math.min(options.limit || PAGINATION.DEFAULT_LIMIT, PAGINATION.MAX_LIMIT);
    const skip = (page - 1) * limit;

    const filter = { employer: employerId };

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('job', 'title')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Payment.countDocuments(filter),
    ]);

    return {
      data: payments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateByRazorpayOrderId(orderId, data) {
    return Payment.findOneAndUpdate({ razorpayOrderId: orderId }, data, { new: true });
  }

  async markAsPaid(orderId, paymentId, signature) {
    return Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      {
        status: PAYMENT_STATUS.PAID,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        paidAt: new Date(),
      },
      { new: true },
    );
  }

  async markAsFailed(orderId) {
    return Payment.findOneAndUpdate(
      { razorpayOrderId: orderId },
      { status: PAYMENT_STATUS.FAILED },
      { new: true },
    );
  }

  async findByIdempotencyKey(key) {
    return Payment.findOne({ idempotencyKey: key });
  }

  async countPayments(query = {}) {
    return Payment.countDocuments(query);
  }

  async getTotalRevenue() {
    const result = await Payment.aggregate([
      { $match: { status: PAYMENT_STATUS.PAID } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    return result[0] || { total: 0, count: 0 };
  }

  async getRevenueThisMonth() {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const result = await Payment.aggregate([
      {
        $match: {
          status: PAYMENT_STATUS.PAID,
          paidAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);
    return result[0] || { total: 0, count: 0 };
  }
}

module.exports = new PaymentRepository();
