import client from './client';

export const ownerApi = {
  getSalonAppointments: (params) => client.get('/appointments/salon', { params }),
  updateAppointmentStatus: (id, status) => client.patch(`/appointments/${id}/status`, { status }),
  getMyServices: () => client.get('/services'),
  createService: (data) => client.post('/services', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  updateService: (id, data) => client.patch(`/services/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteService: (id) => client.delete(`/services/${id}`),
  getMySalon: () => client.get('/salons/my/salon'),
  getRevenueReport: (params) => client.get('/reports/revenue', { params }),
  getBookingStats: (params) => client.get('/reports/bookings', { params }),
};
