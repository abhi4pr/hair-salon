import admin from '../config/firebase.js';
import logger from '../config/logger.js';

export const sendPush = async ({ token, title, body, data = {} }) => {
  if (!token) return;
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data,
      android: { priority: 'high' },
    });
  } catch (err) {
    logger.warn(`[FCM] ${err.message}`);
  }
};

export const sendPushToMany = async ({ tokens, title, body, data = {} }) => {
  const validTokens = tokens.filter(Boolean);
  if (!validTokens.length) return;
  try {
    await admin.messaging().sendEachForMulticast({
      tokens: validTokens,
      notification: { title, body },
      data,
      android: { priority: 'high' },
    });
  } catch (err) {
    logger.warn(`[FCM Multicast] ${err.message}`);
  }
};
