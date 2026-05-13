const admin = require('../config/firebase');

const sendPush = async ({ token, title, body, data = {} }) => {
  if (!token) return;
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
      data,
      android: { priority: 'high' },
    });
  } catch (err) {
    console.error('[FCM Error]', err.message);
  }
};

const sendPushToMany = async ({ tokens, title, body, data = {} }) => {
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
    console.error('[FCM Multicast Error]', err.message);
  }
};

module.exports = { sendPush, sendPushToMany };
