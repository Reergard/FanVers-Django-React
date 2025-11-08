import axios from 'axios';
import tokenService from '../auth/tokenService';
import { getCsrfTokenSync, getCsrfToken, clearCsrfToken } from '../utils/csrfToken';

// Прямое использование tokenService (экспортируется как default)
const token = {
  get: () => {
    // Используем getAccessSync() напрямую
    if (typeof tokenService.getAccessSync === 'function') {
      return tokenService.getAccessSync();
    }
    // Fallback для совместимости
    if (typeof tokenService.get === 'function') {
      return tokenService.get();
    }
    return null;
  },

  set: (t) => {
    if (typeof tokenService.setAccess === 'function') {
      tokenService.setAccess(t);
    } else if (typeof tokenService.set === 'function') {
      tokenService.set(t);
    }
  },

  clear: () => {
    if (typeof tokenService.clear === 'function') {
      tokenService.clear();
    }
  },
};

export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'X-Requested-With': 'XMLHttpRequest' },
});

let refreshInFlight = null;
const isAuthPath = (url = '') =>
  url.includes('/users/login/') ||
  url.includes('/users/refresh/') ||
  url.includes('/users/logout/') ||
  url.includes('/users/register/') ||
  url.includes('/users/csrf/'); // CSRF endpoint не требует CSRF токена

// REQUEST: подставляем access токен и CSRF токен
api.interceptors.request.use(async (config) => {
  // Для auth endpoints (кроме refresh/logout) не добавляем CSRF
  const url = config.url || '';
  const needsCsrf = !isAuthPath(url) || url.includes('/users/refresh/') || url.includes('/users/logout/');
  
  // Добавляем CSRF token для POST/PUT/PATCH/DELETE запросов, которые требуют CSRF
  if (needsCsrf && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    const csrfToken = getCsrfTokenSync();
    if (csrfToken) {
      config.headers = config.headers || {};
      config.headers['X-CSRFToken'] = csrfToken;
    } else {
      // Если токена нет, пытаемся получить асинхронно
      // Это может быть проблемой для синхронных запросов, но обычно токен уже есть в cookie
      try {
        const token = await getCsrfToken(api);
        config.headers = config.headers || {};
        config.headers['X-CSRFToken'] = token;
      } catch (error) {
        // CSRF token will be fetched on next request
      }
    }
  }
  
  // Добавляем access токен для всех запросов (кроме auth endpoints)
  if (!isAuthPath(url)) {
    const access = token.get();
    if (access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access}`;
    }
  }
  
  return config;
});

// RESPONSE: один retry по 401 через refresh
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const { config, response } = error;
    const original = config || {};
    const status = response?.status;

    if (status !== 401 || isAuthPath(original.url || '')) {
      return Promise.reject(error);
    }

    if (original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      if (!refreshInFlight) {
        // Получаем CSRF token перед refresh запросом
        const csrfToken = await getCsrfToken(api);
        refreshInFlight = api.post('/users/refresh/', {}, {
          headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
          }
        }); // withCredentials=true → кука уйдёт
      }
      const { data } = await refreshInFlight;
      refreshInFlight = null;

      const newAccess = data?.access;
      if (newAccess) {
        token.set(newAccess);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        // Обновляем CSRF token в заголовке оригинального запроса
        const csrfToken = getCsrfTokenSync();
        if (csrfToken) {
          original.headers['X-CSRFToken'] = csrfToken;
        }
        return api(original);
      }
      throw new Error('No access in refresh response');
    } catch (e) {
      refreshInFlight = null;
      try { 
        token.clear();
        clearCsrfToken(); // Очищаем CSRF token при ошибке
      } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('forceLogout'));
        window.localStorage.setItem('auth_logout', Date.now().toString());
      }
      return Promise.reject(error);
    }
  }
);

export default api;
