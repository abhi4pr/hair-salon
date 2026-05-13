import client from './client';

export const offersApi = {
  getAll: (params) => client.get('/offers', { params }),
  getById: (id) => client.get(`/offers/${id}`),
  applyCoupon: (data) => client.post('/offers/apply-coupon', data),
};
