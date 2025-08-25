import { api } from '../instance';

const chatApi = {
    getChatList: async () => {
        try {
            const response = await api.get('/chat/');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createChat: async (username, message) => {
        try {
            const response = await api.post('/chat/create/', { username, message });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getChatMessages: async (chatId) => {
        try {
            const response = await api.get(`/chat/${chatId}/messages/`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    sendMessage: async (chatId, content) => {
        try {
            const response = await api.post(`/chat/${chatId}/send_message/`, {
                content: content
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteChat: async (chatId) => {
        try {
            await api.delete(`/chat/${chatId}/`);
        } catch (error) {
            throw error;
        }
    }
};

export default chatApi;
