import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

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
    
    // Синхронизируем с другими вкладками
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('auth_logout', Date.now().toString());
    }
    
    console.log('Force logout виконано, очищено всі дані');
  } catch (error) {
    console.error('Помилка при force logout:', error);
  } finally {
    // важливо: розблокувати підстановку токенів для подальшого логіна без перезавантаження вкладки
    forcingLogout = false;
  }
};

api.interceptors.request.use(
  (config) => {
    // Якщо ми вже логаутимся — не підставляємо токен
    if (!forcingLogout) {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // микрозащита от «застрявшего» дефолтного заголовка
        delete config.headers.Authorization;
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
    if (!originalRequest) return Promise.reject(error);

    // якщо вже в процесі форс-логаута — просто пробрасываем ошибку
    if (forcingLogout) return Promise.reject(error);

    // не рефрешим auth ендпоінти
    if (isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    // Обробляємо помилки з'єднання
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('Помилка з\'єднання з сервером:', error.message);
      return Promise.reject(error);
    }

    // 401: пробуем refresh один раз
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // якщо немає токена або refresh — одразу виходимо
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refresh');
      
      // 🔸 Гость без токенов — просто отдаем ошибку наверх, НИКАКИХ forceLogout
      if (!token && !refreshToken) {
        console.log('Гость без токенов, возвращаем 401 без forceLogout');
        return Promise.reject(error);
      }
      
      if (!token || !refreshToken) {
        console.log('Немає токенів для refresh, виконуємо logout');
        forceLogout();
        return Promise.reject(error);
      }

      // якщо refresh вже йде — дочекатися
      if (refreshPromise) {
        try {
          await refreshPromise;
          const newToken = localStorage.getItem('token');
          if (!newToken) {
            console.log('Refresh не повернув новий токен, logout');
            forceLogout();
            return Promise.reject(error);
          }
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${newToken}`,
          };
          return api(originalRequest);
        } catch (e) {
          const isNetwork = e?.code === 'ERR_NETWORK' || e?.message === 'Network Error';
          const status = e?.response?.status;

          // Логаутим ТОЛЬКО при реально невалидном refresh
          if (!isNetwork && (status === 400 || status === 401)) {
            forceLogout();
          }
          // при сетевых/прочих - не логаутим, просто пробрасываем
          return Promise.reject(e);
        }
      }

      // запустити refresh
      refreshPromise = (async () => {
        try {
          console.log('Виконуємо refresh токена...');
          const resp = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
            refresh: refreshToken,
          });
          const { access, refresh: newRefresh } = resp.data || {};
          if (!access) throw new Error('No access in refresh response');

          localStorage.setItem('token', access);
          // Ротация refresh-токена, если сервер его вернул
          if (newRefresh) {
            localStorage.setItem('refresh', newRefresh);
            console.log('Refresh токен також оновлено');
          }
          api.defaults.headers.common.Authorization = `Bearer ${access}`;
          console.log('Refresh токена успішний');
          return access;
        } catch (e) {
          console.log('Refresh токена не вдався:', e.message);
          const isNetwork = e?.code === 'ERR_NETWORK' || e?.message === 'Network Error';
          const status = e?.response?.status;

          if (isNetwork) {
            // сеть упала – НЕ логаутим, просто пробрасываем ошибку
            throw e;
          }
          if (status === 400 || status === 401) {
            // реально невалидный refresh – логаут
            forceLogout();
          } else {
            // любые другие статусы – не логаутим
            throw e;
          }
          throw e;
        } finally {
          refreshPromise = null;
        }
      })();

      try {
        await refreshPromise;
        const newToken = localStorage.getItem('token');
        if (!newToken) {
          console.log('Немає нового токена після refresh, logout');
          forceLogout();
          return Promise.reject(error);
        }
        originalRequest.headers = {
          ...(originalRequest.headers || {}),
          Authorization: `Bearer ${newToken}`,
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
