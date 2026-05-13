import client from './client';

export const authApi = {
  register: (data) => client.post('/auth/register', data),
  login: (data) => client.post('/auth/login', data),
  verifyOTP: (data) => client.post('/auth/verify-otp', data),
  resendOTP: (data) => client.post('/auth/resend-otp', data),
  forgotPassword: (data) => client.post('/auth/forgot-password', data),
  resetPassword: (data) => client.post('/auth/reset-password', data),
  logout: () => client.delete('/auth/logout'),
  refreshToken: (data) => client.post('/auth/refresh-token', data),
};
