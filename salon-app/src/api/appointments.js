import client from './client';

export const appointmentsApi = {
  getSlots: (salonId, params) => client.get(`/appointments/salons/${salonId}/slots`, { params }),
  create: (data) => client.post('/appointments', data),
  getMy: (params) => client.get('/appointments/my', { params }),
  getById: (id) => client.get(`/appointments/${id}`),
  cancel: (id, data) => client.patch(`/appointments/${id}/cancel`, data),
  reschedule: (id, data) => client.patch(`/appointments/${id}/reschedule`, data),
  addToWaitingList: (id) => client.post(`/appointments/${id}/waiting-list`),
};
