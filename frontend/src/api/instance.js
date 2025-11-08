import axios from 'axios';
import * as TS from '../auth/tokenService'; // <- берём всё, чем бы ни экспортировался сервис

// Унифицированная обёртка над tokenService (поддержит разные варианты имён/экспортов)
const token = {
  get:
    TS.get ||
    TS.getAccess ||
    TS.getToken ||
    (TS.default && (TS.default.get || TS.default.getAccess || TS.default.getToken)) ||
    (() => (typeof window !== 'undefined' ? window.localStorage.getItem('access') : null)),

  set:
    TS.set ||
    TS.setAccess ||
    TS.setToken ||
    (TS.default && (TS.default.set || TS.default.setAccess || TS.default.setToken)) ||
    (t => { if (typeof window !== 'undefined') window.localStorage.setItem('access', t); }),

  clear:
    TS.clear ||
    TS.clearAccess ||
    TS.clearToken ||
    (TS.default && (TS.default.clear || TS.default.clearAccess || TS.default.clearToken)) ||
    (() => { if (typeof window !== 'undefined') window.localStorage.removeItem('access'); }),
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
  url.includes('/users/register/');

// REQUEST: только подставляем access, не рефрешим тут
api.interceptors.request.use((config) => {
  if (isAuthPath(config.url || '')) return config;
  const access = token.get();
  if (access) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${access}`;
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
        refreshInFlight = api.post('/users/refresh/', {}); // withCredentials=true → кука уйдёт
      }
      const { data } = await refreshInFlight;
      refreshInFlight = null;

      const newAccess = data?.access;
      if (newAccess) {
        token.set(newAccess);
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newAccess}`;
        return api(original);
      }
      throw new Error('No access in refresh response');
    } catch (e) {
      refreshInFlight = null;
      try { token.clear(); } catch {}
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('forceLogout'));
        window.localStorage.setItem('auth_logout', Date.now().toString());
      }
      return Promise.reject(error);
    }
  }
);

export default api;
