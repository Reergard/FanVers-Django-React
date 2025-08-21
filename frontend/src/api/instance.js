import axios from 'axios';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

export const api = axios.create({
  baseURL: API_URL,
});

let refreshPromise = null;
let forcingLogout = false; // ⬅️ флаг "логаут выполняется/выполнен"

const isAuthEndpoint = (url = '') =>
  url.includes('/auth/jwt/refresh/') || url.includes('/auth/jwt/create/');

const forceLogout = () => {
  if (forcingLogout) return;        // ⬅️ не повторяем
  forcingLogout = true;

  try {
    // Очищаємо localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    
    // Очищаємо заголовки axios
    delete api.defaults.headers.common.Authorization;
    
    // Додаємо подію для очищення Redux state
    window.dispatchEvent(new CustomEvent('forceLogout'));
    
    console.log('🚪 Force logout виконано, очищено всі дані');
  } catch (error) {
    console.error('❌ Помилка при force logout:', error);
  } finally {
    // Заміняємо URL (без додавання запису в історію)
    window.location.replace('/login');
  }
};

api.interceptors.request.use(
  (config) => {
    // Якщо ми вже логаутимся — не підставляємо токен
    if (!forcingLogout) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `JWT ${token}`;
      }
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // якщо вже в процесі форс-логаута — просто пробрасываем ошибку
    if (forcingLogout) return Promise.reject(error);

    // не рефрешим auth ендпоінти
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Обробляємо помилки з'єднання
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Помилка з\'єднання з сервером:', error.message);
      return Promise.reject(error);
    }

    // 401: пробуем refresh один раз
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // якщо немає токена або refresh — одразу виходимо
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh');
      if (!token || !refreshToken) {
        console.log('❌ Немає токенів для refresh, виконуємо logout');
        forceLogout();
        return Promise.reject(error);
      }

      // якщо refresh вже йде — дочекатися
      if (refreshPromise) {
        try {
          await refreshPromise;
          const newToken = localStorage.getItem('token');
          if (!newToken) {
            console.log('❌ Refresh не повернув новий токен, logout');
            forceLogout();
            return Promise.reject(error);
          }
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `JWT ${newToken}`,
          };
          return api(originalRequest);
        } catch (e) {
          console.log('❌ Помилка при очікуванні refresh, logout');
          forceLogout();
          return Promise.reject(e);
        }
      }

      // запустити refresh
      refreshPromise = (async () => {
        try {
          console.log('🔄 Виконуємо refresh токена...');
          const resp = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = resp.data || {};
          if (!access) throw new Error('No access in refresh response');

          localStorage.setItem('token', access);
          api.defaults.headers.common.Authorization = `JWT ${access}`;
          console.log('✅ Refresh токена успішний');
          return access;
        } catch (e) {
          console.log('❌ Refresh токена не вдався:', e.message);
          forceLogout();
          throw e;
        } finally {
          refreshPromise = null;
        }
      })();

      try {
        await refreshPromise;
        const newToken = localStorage.getItem('token');
        if (!newToken) {
          console.log('❌ Немає нового токена після refresh, logout');
          forceLogout();
          return Promise.reject(error);
        }
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `JWT ${newToken}`,
        };
        return api(originalRequest);
      } catch (e) {
        // важливий момент: пробрасываем ПРИЧИНУ, а не исходную ошибку
        return Promise.reject(e);
      }
    }

    return Promise.reject(error);
  }
);

export default api;