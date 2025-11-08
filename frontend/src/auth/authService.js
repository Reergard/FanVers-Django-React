import { api } from '../api/instance';
import tokenService from './tokenService';
import { handleAuthError } from './utils/authErrorUtils';

// Дедупликация запросов профиля (оставил как у тебя)
let profilePromise = null;

const authService = {
  register: async (userData) => {
    try {
      // ВАЖНО: твой бэкенд — /users/register/
      const { data } = await api.post('/users/register/', userData, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      // сервер возвращает { user, access } и кладёт refresh в HttpOnly cookie
      if (data?.access) {
        // у тебя в tokenService методы setAccess/clear — используем их
        if (typeof tokenService.setAccess === 'function') {
          tokenService.setAccess(data.access);
        } else if (typeof tokenService.set === 'function') {
          tokenService.set(data.access);
        }
      }
      return data;
    } catch (error) {
      // покажем точную причину 400, если бэкенд вернул поля
      const r = error?.response;
      if (r?.status === 400 && r?.data && typeof r.data === 'object') {
        const details = Object.entries(r.data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : String(v)}`)
          .join('\n');
        throw details || 'Помилка валідації форми';
      }
      const userMessage = handleAuthError(error);
      throw userMessage;
    }
  },

  login: async (userData) => {
    try {
      const { data } = await api.post('/users/login/', userData, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      if (data?.access) {
        if (typeof tokenService.setAccess === 'function') {
          tokenService.setAccess(data.access);
        } else if (typeof tokenService.set === 'function') {
          tokenService.set(data.access);
        }
      }
      return data;
    } catch (error) {
      const userMessage = handleAuthError(error);
      throw userMessage;
    }
  },

  logout: async () => {
    try {
      // Получаем CSRF token перед logout
      const { getCsrfToken } = await import('../utils/csrfToken');
      const csrfToken = await getCsrfToken(api);
      
      await api.post('/users/logout/', null, {
        headers: {
          'X-CSRFToken': csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
    } finally {
      if (typeof tokenService.clear === 'function') tokenService.clear();
      else if (typeof tokenService.clearAccess === 'function') tokenService.clearAccess();
      
      // Очищаем CSRF token при logout
      const { clearCsrfToken } = await import('../utils/csrfToken');
      clearCsrfToken();
    }
  },

  activate: async (userData) => {
    try {
      // если активация у тебя тоже кастомная — потом поменяем, пока оставил как было
      const response = await api.post('/auth/users/activation/', userData);
      return response.data;
    } catch (error) {
      const userMessage = handleAuthError(error);
      throw userMessage;
    }
  },

  getProfile: async () => {
    try {
      const { data } = await api.get('/users/profile/');
      return data;
    } catch (error) {
      const userMessage = handleAuthError(error);
      throw userMessage;
    }
  },
};

export default authService;
