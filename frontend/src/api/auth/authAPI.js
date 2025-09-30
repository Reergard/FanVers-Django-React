import { api } from '../instance';

export const authAPI = {
    login: async (userData) => {
        const response = await api.post('/users/login/', userData, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        });
        return response;
    },
    
    register: (userData) => 
        api.post('/auth/users/', userData),
    
    activate: (userData) => 
        api.post('/auth/users/activation/', userData),
    
    saveToken: (token) => 
        api.post('/auth/token/save/', { token }),
    
    resetPassword: (userData) => 
        api.post('/auth/users/reset_password/', userData),
    
    resetPasswordConfirm: (userData) => 
        api.post('/auth/users/reset_password_confirm/', userData)
}; 
