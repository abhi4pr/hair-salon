import client from './client';

export const reviewsApi = {
  getSalonReviews: (salonId, params) => client.get(`/reviews/salon/${salonId}`, { params }),
  create: (data) => client.post('/reviews', data),
  reply: (reviewId, data) => client.post(`/reviews/${reviewId}/reply`, data),
  report: (reviewId, data) => client.post(`/reviews/${reviewId}/report`, data),
};
