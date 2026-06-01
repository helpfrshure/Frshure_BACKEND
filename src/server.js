require('dotenv').config();

const http = require('http');
const app = require('./app');
const connectDatabase = require('./config/database');
const { initializeCloudinary } = require('./config/cloudinary');
const { initializeRazorpay } = require('./config/razorpay');
const { initializeSocket } = require('./socket');
const FirebaseService = require('./firebase');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason: reason.message || reason });
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

const startServer = async () => {
  try {
    await connectDatabase();

    const httpServer = http.createServer(app);

    initializeSocket(httpServer);

    initializeCloudinary();
    initializeRazorpay();
    FirebaseService.initialize();

    httpServer.listen(PORT, () => {
      logger.info(`FRSHURE API server started on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Base: http://localhost:${PORT}/api/v1`);
      logger.info(`API Docs: http://localhost:${PORT}/api-docs`);
      logger.info(`Health: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Server startup failed', { error: error.message });
    process.exit(1);
  }
};

startServer();
