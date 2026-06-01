const admin = require('firebase-admin');
const logger = require('./logger');

let firebaseApp = null;

const initializeFirebase = () => {
  if (firebaseApp) return firebaseApp;

  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
  ];

  const missing = requiredVars.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    logger.warn(
      `Firebase config missing: ${missing.join(', ')}. Firebase disabled.`,
    );
    return null;
  }

  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      databaseURL: process.env.FIREBASE_DATABASE_URL,
    });

    logger.info('Firebase Admin SDK initialized');
    return firebaseApp;
  } catch (error) {
    logger.error('Firebase initialization failed', { error: error.message });
    return null;
  }
};

const getFirebaseApp = () => firebaseApp;

const getFirebaseDB = () => {
  if (!firebaseApp) return null;
  return admin.database();
};

const getFirebaseMessaging = () => {
  if (!firebaseApp) return null;
  return admin.messaging();
};

const getFirebaseAuth = () => {
  if (!firebaseApp) return null;
  return admin.auth();
};

module.exports = {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseDB,
  getFirebaseMessaging,
  getFirebaseAuth,
};
