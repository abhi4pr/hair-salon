import client from './client';

export const loyaltyApi = {
  getMyPoints: () => client.get('/loyalty/my'),
  getHistory: () => client.get('/loyalty/history'),
  getMembershipPlans: () => client.get('/loyalty/plans'),
  subscribePlan: (planId) => client.post(`/loyalty/plans/${planId}/subscribe`),
};
