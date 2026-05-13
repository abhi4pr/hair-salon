const crypto = require('crypto');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const otpExpiryTime = () => {
  const minutes = parseInt(process.env.OTP_EXPIRY_MINUTES) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
};

module.exports = { generateOTP, otpExpiryTime };
