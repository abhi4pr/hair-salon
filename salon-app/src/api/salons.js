import client from './client';

export const salonsApi = {
  search: (params) => client.get('/salons/search', { params }),
  getById: (id) => client.get(`/salons/${id}`),
  getMy: () => client.get('/salons/my/salon'),
};
