import { api } from '../api/instance';
import tokenService from './tokenService';
import { handleAuthError } from './utils/authErrorUtils';

// Дедупликация запросов профиля (оставил как у тебя)
let profilePromise = null;

const authService = {
  register: async (userData) => {
    console.log('📝 [authService.register] === START REGISTER ===');
    console.log('📝 [authService.register] Time:', new Date().toISOString());
    console.log('📝 [authService.register] Username:', userData.username);
    console.log('📝 [authService.register] Email:', userData.email);
    console.log('📝 [authService.register] Password:', userData.password ? '***' : 'NOT SET');
    
    try {
      console.log('📝 [authService.register] Шаг 1: Отправляем POST /users/register/');
      console.log('📝 [authService.register] Шаг 1: Headers:', { 'X-Requested-With': 'XMLHttpRequest' });
      console.log('📝 [authService.register] Шаг 1: Body:', { 
        username: userData.username, 
        email: userData.email, 
        password: '***' 
      });
      
      // ВАЖНО: твой бэкенд — /users/register/
      const { data } = await api.post('/users/register/', userData, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      
      console.log('📝 [authService.register] Шаг 2: Ответ получен:', {
        status: '201',
        hasAccess: !!data?.access,
        hasUser: !!data?.user,
        accessLength: data?.access?.length || 0
      });
      
      // сервер возвращает { user, access } и кладёт refresh в HttpOnly cookie
      if (data?.access) {
        console.log('📝 [authService.register] Шаг 3: Сохраняем access token...');
        // у тебя в tokenService методы setAccess/clear — используем их
        if (typeof tokenService.setAccess === 'function') {
          tokenService.setAccess(data.access);
          console.log('📝 [authService.register] Шаг 3: Token saved via setAccess');
        } else if (typeof tokenService.set === 'function') {
          tokenService.set(data.access);
          console.log('📝 [authService.register] Шаг 3: Token saved via set');
        } else {
          console.error('📝 [authService.register] Шаг 3: No tokenService method found!');
        }
        
        const saved = tokenService.hasAccess ? tokenService.hasAccess() : (tokenService.getAccessSync ? tokenService.getAccessSync() : null);
        console.log('📝 [authService.register] Шаг 4: Token verification:', saved ? 'OK' : 'FAILED');
        console.log('📝 [authService.register] === REGISTER SUCCESS ===');
      } else {
        console.warn('📝 [authService.register] Шаг 3: В ответе нет access token!');
      }
      
      return data;
    } catch (error) {
      console.error('📝 [authService.register] === REGISTER FAILED ===');
      console.error('📝 [authService.register] Error status:', error.response?.status);
      console.error('📝 [authService.register] Error data:', error.response?.data);
      console.error('📝 [authService.register] Error message:', error.message);
      
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
    console.log('🔐 [authService.login] === START LOGIN ===');
    console.log('🔐 [authService.login] Time:', new Date().toISOString());
    console.log('🔐 [authService.login] Username:', userData.username);
    console.log('🔐 [authService.login] Password:', userData.password ? '***' : 'NOT SET');
    
    try {
      console.log('🔐 [authService.login] Шаг 1: Отправляем POST /users/login/');
      console.log('🔐 [authService.login] Шаг 1: Headers:', { 'X-Requested-With': 'XMLHttpRequest' });
      console.log('🔐 [authService.login] Шаг 1: Body:', { username: userData.username, password: '***' });
      
      const { data } = await api.post('/users/login/', userData, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
      });
      
      console.log('🔐 [authService.login] Шаг 2: Ответ получен:', {
        status: '200',
        hasAccess: !!data?.access,
        accessLength: data?.access?.length || 0
      });
      
      if (data?.access) {
        console.log('🔐 [authService.login] Шаг 3: Сохраняем access token...');
        if (typeof tokenService.setAccess === 'function') {
          tokenService.setAccess(data.access);
          console.log('🔐 [authService.login] Шаг 3: Token saved via setAccess');
        } else if (typeof tokenService.set === 'function') {
          tokenService.set(data.access);
          console.log('🔐 [authService.login] Шаг 3: Token saved via set');
        } else {
          console.error('🔐 [authService.login] Шаг 3: No tokenService method found!');
        }
        
        // Проверяем, что токен действительно сохранился
        const saved = tokenService.hasAccess ? tokenService.hasAccess() : (tokenService.getAccessSync ? tokenService.getAccessSync() : null);
        console.log('🔐 [authService.login] Шаг 4: Token verification:', saved ? 'OK' : 'FAILED');
        console.log('🔐 [authService.login] === LOGIN SUCCESS ===');
      } else {
        console.warn('🔐 [authService.login] Шаг 3: В ответе нет access token!');
      }
      
      return data;
    } catch (error) {
      console.error('🔐 [authService.login] === LOGIN FAILED ===');
      console.error('🔐 [authService.login] Error status:', error.response?.status);
      console.error('🔐 [authService.login] Error data:', error.response?.data);
      console.error('🔐 [authService.login] Error message:', error.message);
      
      const userMessage = handleAuthError(error);
      throw userMessage;
    }
  },

  logout: async () => {
    console.log('🚪 [authService.logout] === START LOGOUT ===');
    console.log('🚪 [authService.logout] Time:', new Date().toISOString());
    
    try {
      console.log('🚪 [authService.logout] Шаг 1: Получаем CSRF token...');
      // Получаем CSRF token перед logout
      const { getCsrfToken } = await import('../utils/csrfToken');
      const csrfToken = await getCsrfToken(api);
      console.log('🚪 [authService.logout] Шаг 1: CSRF token получен:', csrfToken ? `${csrfToken.substring(0, 20)}...` : 'NULL');
      
      console.log('🚪 [authService.logout] Шаг 2: Отправляем POST /users/logout/');
      console.log('🚪 [authService.logout] Шаг 2: Headers:', {
        'X-CSRFToken': csrfToken ? `${csrfToken.substring(0, 20)}...` : 'NOT SET',
        'X-Requested-With': 'XMLHttpRequest'
      });
      
      await api.post('/users/logout/', null, {
        headers: {
          'X-CSRFToken': csrfToken,
          'X-Requested-With': 'XMLHttpRequest'
        }
      });
      
      console.log('🚪 [authService.logout] Шаг 3: Logout запрос успешен');
    } catch (error) {
      console.error('🚪 [authService.logout] Шаг 3: Logout запрос failed:', error.response?.status, error.response?.data);
    } finally {
      console.log('🚪 [authService.logout] Шаг 4: Очищаем токены...');
      if (typeof tokenService.clear === 'function') tokenService.clear();
      else if (typeof tokenService.clearAccess === 'function') tokenService.clearAccess();
      console.log('🚪 [authService.logout] Шаг 4: Токены очищены');
      
      // Очищаем CSRF token при logout
      console.log('🚪 [authService.logout] Шаг 5: Очищаем CSRF token...');
      const { clearCsrfToken } = await import('../utils/csrfToken');
      clearCsrfToken();
      console.log('🚪 [authService.logout] Шаг 5: CSRF token очищен');
      console.log('🚪 [authService.logout] === LOGOUT COMPLETE ===');
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
    console.log('👤 [authService.getProfile] === START GET PROFILE ===');
    console.log('👤 [authService.getProfile] Time:', new Date().toISOString());
    
    try {
      console.log('👤 [authService.getProfile] Шаг 1: Отправляем GET /users/profile/');
      console.log('👤 [authService.getProfile] Шаг 1: Проверяем токен перед запросом...');
      const token = tokenService.getAccessSync ? tokenService.getAccessSync() : null;
      console.log('👤 [authService.getProfile] Шаг 1: Token в памяти:', token ? `${token.substring(0, 20)}...` : 'NULL');
      
      const { data } = await api.get('/users/profile/');
      
      console.log('👤 [authService.getProfile] Шаг 2: Ответ получен:', {
        status: '200',
        hasData: !!data,
        username: data?.username || 'N/A',
        email: data?.email || 'N/A'
      });
      console.log('👤 [authService.getProfile] Шаг 2: Полный профиль:', data);
      console.log('👤 [authService.getProfile] === GET PROFILE SUCCESS ===');
      
      return data;
    } catch (error) {
      console.error('👤 [authService.getProfile] === GET PROFILE FAILED ===');
      console.error('👤 [authService.getProfile] Error status:', error.response?.status);
      console.error('👤 [authService.getProfile] Error data:', error.response?.data);
      console.error('👤 [authService.getProfile] Error message:', error.message);
      
      const userMessage = handleAuthError(error);
      throw userMessage;
    }
  },
};

export default authService;
