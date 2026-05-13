import client from './client';

export const paymentApi = {
  initiate: (data) => client.post('/payments/initiate', data),
  confirm: (data) => client.post('/payments/confirm', data),
  getHistory: () => client.get('/payments/history'),
  getInvoice: (appointmentId) => client.get(`/payments/invoice/${appointmentId}`, { responseType: 'blob' }),
  refund: (data) => client.post('/payments/refund', data),
};
