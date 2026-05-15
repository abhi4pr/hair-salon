import client from './client';

export const loyaltyApi = {
  getMyPoints: () => client.get('/loyalty/balance'),
  getHistory: () => client.get('/loyalty/history'),
  getMembershipPlans: () => client.get('/loyalty/plans'),
  subscribePlan: (planId, data) => client.post('/loyalty/memberships/purchase', { planId, ...(data || {}) }),
};
