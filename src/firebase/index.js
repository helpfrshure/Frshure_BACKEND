const {
  initializeFirebase,
  getFirebaseApp,
  getFirebaseDB,
  getFirebaseMessaging,
  getFirebaseAuth,
} = require('../config/firebase');
const logger = require('../config/logger');

class FirebaseService {
  constructor() {
    this.initialized = false;
  }

  initialize() {
    if (this.initialized) return;
    initializeFirebase();
    this.initialized = true;
  }

  getDB() {
    return getFirebaseDB();
  }

  getMessaging() {
    return getFirebaseMessaging();
  }

  getAuth() {
    return getFirebaseAuth();
  }

  async setUserPresence(userId, userModel, status) {
    try {
      const db = this.getDB();
      if (!db) return;

      await db.ref(`presence/${userModel.toLowerCase()}/${userId}`).set({
        status,
        lastSeen: new Date().toISOString(),
        online: status === 'online',
      });
    } catch (error) {
      logger.error('Firebase presence update failed', { error: error.message });
    }
  }

  async getUserPresence(userId, userModel) {
    try {
      const db = this.getDB();
      if (!db) return null;

      const snapshot = await db
        .ref(`presence/${userModel.toLowerCase()}/${userId}`)
        .once('value');

      return snapshot.val();
    } catch (error) {
      logger.error('Firebase presence fetch failed', { error: error.message });
      return null;
    }
  }
}

module.exports = new FirebaseService();
