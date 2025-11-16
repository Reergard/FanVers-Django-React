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
  const url = config.url || '';
  const method = config.method?.toUpperCase() || 'GET';
  
  console.log('🌐 [instance.request] === START REQUEST ===');
  console.log('🌐 [instance.request] Method:', method);
  console.log('🌐 [instance.request] URL:', url);
  console.log('🌐 [instance.request] Time:', new Date().toISOString());
  
  // Для auth endpoints (кроме refresh/logout) не добавляем CSRF
  const needsCsrf = !isAuthPath(url) || url.includes('/users/refresh/') || url.includes('/users/logout/');
  console.log('🌐 [instance.request] Needs CSRF:', needsCsrf);
  console.log('🌐 [instance.request] Is auth path:', isAuthPath(url));
  
  // Добавляем CSRF token для POST/PUT/PATCH/DELETE запросов, которые требуют CSRF
  if (needsCsrf && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
    console.log('🌐 [instance.request] Шаг 1: Проверяем CSRF token...');
    const csrfToken = getCsrfTokenSync();
    if (csrfToken) {
      config.headers = config.headers || {};
      config.headers['X-CSRFToken'] = csrfToken;
      console.log('🌐 [instance.request] Шаг 1: CSRF token добавлен из кеша:', `${csrfToken.substring(0, 20)}...`);
    } else {
      // Если токена нет, пытаемся получить асинхронно
      // Это может быть проблемой для синхронных запросов, но обычно токен уже есть в cookie
      try {
        console.log('🌐 [instance] CSRF token не найден синхронно, запрашиваем асинхронно...');
        const token = await getCsrfToken(api);
        config.headers = config.headers || {};
        config.headers['X-CSRFToken'] = token;
        console.log('🌐 [instance] CSRF token получен асинхронно:', `${token.substring(0, 20)}...`);
      } catch (error) {
        console.warn('🌐 [instance] Failed to get CSRF token for request:', error);
        // CSRF token will be fetched on next request
      }
    }
  }
  
  // Добавляем access токен для всех запросов (кроме auth endpoints)
  if (!isAuthPath(url)) {
    console.log('🌐 [instance.request] Шаг 2: Проверяем access token...');
    const access = token.get();
    if (access) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access}`;
      console.log('🌐 [instance.request] Шаг 2: Authorization header добавлен');
      console.log('🌐 [instance.request] Шаг 2: Token length:', access.length);
      console.log('🌐 [instance.request] Шаг 2: Token preview:', `${access.substring(0, 30)}...`);
    } else {
      console.warn('🌐 [instance.request] Шаг 2: Access token не найден!');
    }
  } else {
    console.log('🌐 [instance.request] Шаг 2: Auth endpoint, пропускаем Authorization header');
  }
  
  console.log('🌐 [instance.request] Final headers:', {
    'X-CSRFToken': config.headers?.['X-CSRFToken'] ? `${config.headers['X-CSRFToken'].substring(0, 20)}...` : 'NOT SET',
    'Authorization': config.headers?.Authorization ? `${config.headers.Authorization.substring(0, 30)}...` : 'NOT SET',
    'X-Requested-With': config.headers?.['X-Requested-With'] || 'NOT SET'
  });
  console.log('🌐 [instance.request] === REQUEST CONFIGURED ===');
  
  return config;
});

// RESPONSE: один retry по 401 через refresh
api.interceptors.response.use(
  (resp) => {
    const url = resp.config?.url || '';
    const method = resp.config?.method?.toUpperCase() || 'GET';
    
    console.log('🌐 [instance.response] === RESPONSE RECEIVED ===');
    console.log('🌐 [instance.response] Method:', method);
    console.log('🌐 [instance.response] URL:', url);
    console.log('🌐 [instance.response] Status:', resp.status);
    console.log('🌐 [instance.response] Time:', new Date().toISOString());
    
    if (resp.data) {
      console.log('🌐 [instance.response] Response data keys:', Object.keys(resp.data));
      if (resp.data.access) {
        console.log('🌐 [instance.response] Access token в ответе: length =', resp.data.access.length);
      }
      if (resp.data.csrfToken) {
        console.log('🌐 [instance.response] CSRF token в ответе: length =', resp.data.csrfToken.length);
      }
    }
    
    console.log('🌐 [instance.response] === RESPONSE PROCESSED ===');
    return resp;
  },
  async (error) => {
    const { config, response } = error;
    const original = config || {};
    const status = response?.status;
    const url = original.url || '';
    const method = original.method?.toUpperCase() || 'GET';
    
    console.log('🌐 [instance.response.error] === ERROR RECEIVED ===');
    console.log('🌐 [instance.response.error] Method:', method);
    console.log('🌐 [instance.response.error] URL:', url);
    console.log('🌐 [instance.response.error] Status:', status);
    console.log('🌐 [instance.response.error] Time:', new Date().toISOString());
    console.log('🌐 [instance.response.error] Error data:', response?.data);
    console.log('🌐 [instance.response.error] Error message:', error.message);

    if (status !== 401 || isAuthPath(original.url || '')) {
      console.log('🌐 [instance.response.error] Not a 401 or auth path, rejecting...');
      return Promise.reject(error);
    }
    
    console.log('🌐 [instance.response.error] 401 detected, attempting refresh...');

    if (original._retry) {
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      console.log('🔄 [instance.interceptor] === START REFRESH ===');
      console.log('🔄 [instance.interceptor] Original request:', original.method, original.url);
      
      if (!refreshInFlight) {
        console.log('🔄 [instance.interceptor] Шаг 1: Получаем CSRF token перед refresh...');
        // Получаем CSRF token перед refresh запросом
        const csrfToken = await getCsrfToken(api);
        console.log('🔄 [instance.interceptor] Шаг 1: CSRF token получен:', csrfToken ? `${csrfToken.substring(0, 20)}...` : 'NULL');
        
        console.log('🔄 [instance.interceptor] Шаг 2: Отправляем POST /users/refresh/');
        console.log('🔄 [instance.interceptor] Шаг 2: Headers:', {
          'X-CSRFToken': csrfToken ? `${csrfToken.substring(0, 20)}...` : 'NOT SET',
          'X-Requested-With': 'XMLHttpRequest'
        });
        
        refreshInFlight = api.post('/users/refresh/', {}, {
          headers: {
            'X-CSRFToken': csrfToken,
            'X-Requested-With': 'XMLHttpRequest'
          }
        }); // withCredentials=true → кука уйдёт
      } else {
        console.log('🔄 [instance.interceptor] Refresh уже в процессе, ждем...');
      }
      
      const { data } = await refreshInFlight;
      refreshInFlight = null;

      console.log('🔄 [instance.interceptor] Шаг 3: Refresh ответ получен:', {
        hasAccess: !!data?.access,
        accessLength: data?.access?.length || 0
      });

      const newAccess = data?.access;
      if (newAccess) {
        console.log('🔄 [instance.interceptor] Шаг 4: Сохраняем новый access token...');
        token.set(newAccess);
        console.log('🔄 [instance.interceptor] Шаг 4: Token сохранен');
        
        console.log('🔄 [instance.interceptor] Шаг 5: Обновляем оригинальный запрос...');
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        // Обновляем CSRF token в заголовке оригинального запроса
        const csrfToken = getCsrfTokenSync();
        if (csrfToken) {
          original.headers['X-CSRFToken'] = csrfToken;
          console.log('🔄 [instance.interceptor] Шаг 5: CSRF token обновлен в оригинальном запросе');
        }
        
        console.log('🔄 [instance.interceptor] Шаг 6: Повторяем оригинальный запрос:', original.method, original.url);
        console.log('🔄 [instance.interceptor] === REFRESH SUCCESS ===');
        return api(original);
      }
      console.error('🔄 [instance.interceptor] Шаг 4: В ответе нет access token!');
      throw new Error('No access in refresh response');
    } catch (e) {
      console.error('🔄 [instance.interceptor] === REFRESH FAILED ===');
      console.error('🔄 [instance.interceptor] Error:', e.response?.status, e.response?.data);
      refreshInFlight = null;
      try { 
        console.log('🔄 [instance.interceptor] Очищаем токены...');
        token.clear();
        clearCsrfToken(); // Очищаем CSRF token при ошибке
        console.log('🔄 [instance.interceptor] Токены очищены');
      } catch {}
      if (typeof window !== 'undefined') {
        console.log('🔄 [instance.interceptor] Отправляем событие forceLogout...');
        window.dispatchEvent(new CustomEvent('forceLogout'));
        window.localStorage.setItem('auth_logout', Date.now().toString());
      }
      return Promise.reject(error);
    }
  }
);

export default api;
