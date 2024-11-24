import { api } from '../api/instance';

const authService = {
    register: async (userData) => {
        const response = await api.post('/auth/users/', userData);
        return response.data;
    },

    login: async (userData) => {
        const response = await api.post('/auth/jwt/create/', userData);
        if (response.data) {
            localStorage.setItem('token', response.data.access);
            localStorage.setItem('refresh', response.data.refresh);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        localStorage.removeItem('user');
    },

    activate: async (userData) => {
        const response = await api.post('/auth/users/activation/', userData);
        return response.data;
    },

    resetPassword: async (userData) => {
        const response = await api.post('/auth/users/reset_password/', userData);
        return response.data;
    },

    resetPasswordConfirm: async (userData) => {
        const response = await api.post('/auth/users/reset_password_confirm/', userData);
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/users/me/');
        return response.data;
    },

    updateProfile: async (profileData) => {
        const response = await api.put('/auth/users/me/', profileData);
        return response.data;
    }
};

export default authService;