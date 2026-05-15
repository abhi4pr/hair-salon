import client from './client';

export const chatApi = {
  getConversations: () => client.get('/chat/my-conversations'),
  getMessages: (salonId, params) => client.get(`/chat/messages/${salonId}`, { params }),
  sendMessage: (data) => client.post('/chat/messages', data),
};
