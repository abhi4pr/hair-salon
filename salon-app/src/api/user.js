import client from './client';

export const userApi = {
  getMe: () => client.get('/users/me'),
  updateMe: (data) => client.patch('/users/me', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  deleteAccount: () => client.delete('/users/me'),
  changePassword: (data) => client.patch('/users/me/password', data),
  addAddress: (data) => client.post('/users/me/addresses', data),
  updateAddress: (id, data) => client.patch(`/users/me/addresses/${id}`, data),
  deleteAddress: (id) => client.delete(`/users/me/addresses/${id}`),
  getFavorites: () => client.get('/users/me/favorites'),
  toggleFavorite: (salonId) => client.post(`/users/me/favorites/${salonId}`),
};
