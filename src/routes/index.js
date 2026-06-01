const express = require('express');
const router = express.Router();

const commonRoutes = require('./commonRoutes');
const studentRoutes = require('./studentRoutes');
const employerRoutes = require('./employerRoutes');
const jobRoutes = require('./jobRoutes');
const applicationRoutes = require('./applicationRoutes');
const chatRoutes = require('./chatRoutes');
const notificationRoutes = require('./notificationRoutes');
const paymentRoutes = require('./paymentRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/', commonRoutes);
router.use('/student', studentRoutes);
router.use('/employer', employerRoutes);
router.use('/jobs', jobRoutes);
router.use('/application', applicationRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payment', paymentRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
