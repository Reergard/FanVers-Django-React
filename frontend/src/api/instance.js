import axios from 'axios';
import tokenService from '../auth/tokenService';

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,  // Обязательно для cookie
});

let refreshPromise = null;
let forcingLogout = false;

const isAuthPath = (url = '') =>
  url.includes('/users/login/') || url.includes('/users/refresh/') || url.includes('/users/logout/');

export const forceLogout = () => {
  if (forcingLogout) return;
  forcingLogout = true;
  
  try {
    // Очищаем access из памяти
    tokenService.clear();
    
    // Очищаем заголовки axios
    delete api.defaults.headers.common.Authorization;
    
    // Очищаем localStorage (для совместимости)
    localStorage.removeItem('user');
    
    // Додаємо подію для очищення Redux state
    window.dispatchEvent(new CustomEvent('forceLogout'));
    
    // Синхронизируем с другими вкладками
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('auth_logout', Date.now().toString());
    }
    
    console.log('Force logout виконано, очищено всі дані');
  } catch (error) {
    console.error('Помилка при force logout:', error);
  } finally {
    forcingLogout = false;
  }
};

api.interceptors.request.use(
  async (config) => {
    if (isAuthPath(config.url)) return config;

    // Гарантированно валидный access в заголовке
    const token = await tokenService.getValidAccess(() => {
      // Запускаем refresh один раз для всех запросов
      if (!refreshPromise) {
        refreshPromise = api.post('/users/refresh/', null, {
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
        }).then((res) => {
          tokenService.setAccess(res.data?.access);
          return res.data?.access;
        }).catch((e) => {
          forceLogout();
          throw e;
        }).finally(() => {
          refreshPromise = null;
        });
      }
      return refreshPromise;
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Не форсим Content-Type для FormData
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const { config, response } = error || {};
    if (!config || isAuthPath(config.url)) return Promise.reject(error);

    if (response?.status === 401 && !config.__retried) {
      try {
        config.__retried = true;
        const newToken = await tokenService.getValidAccess(() => {
          if (!refreshPromise) {
            refreshPromise = api.post('/users/refresh/', null, {
              headers: { 'X-Requested-With': 'XMLHttpRequest' },
            }).then((res) => {
              tokenService.setAccess(res.data?.access);
              return res.data?.access;
            }).finally(() => (refreshPromise = null));
          }
          return refreshPromise;
        });
        config.headers.Authorization = `Bearer ${newToken}`;
        return api(config);
      } catch {
        forceLogout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
