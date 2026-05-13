import client from './client';

export const chatApi = {
  getConversations: () => client.get('/chat/conversations'),
  getMessages: (conversationId, params) => client.get(`/chat/conversations/${conversationId}/messages`, { params }),
  sendMessage: (data) => client.post('/chat/messages', data),
  startConversation: (data) => client.post('/chat/conversations', data),
};
