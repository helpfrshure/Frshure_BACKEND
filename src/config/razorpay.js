const Razorpay = require('razorpay');
const logger = require('./logger');

let razorpayInstance = null;

const initializeRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    logger.warn('Razorpay config missing. Payments disabled.');
    return null;
  }

  razorpayInstance = new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });

  logger.info('Razorpay initialized');
  return razorpayInstance;
};

const getRazorpay = () => {
  if (!razorpayInstance) {
    throw new Error('Razorpay not initialized. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  return razorpayInstance;
};

module.exports = {
  initializeRazorpay,
  getRazorpay,
};
