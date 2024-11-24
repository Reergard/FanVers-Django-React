import axios from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `JWT ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh');

            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
                        refresh: refreshToken
                    });

                    const newToken = response.data.access;
                    localStorage.setItem('token', newToken);
                    originalRequest.headers.Authorization = `JWT ${newToken}`;
                    
                    return api(originalRequest);
                } catch (refreshError) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;