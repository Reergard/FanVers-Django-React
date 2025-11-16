/**
 * Утилита для работы с CSRF токенами
 * Django автоматически устанавливает csrftoken cookie при первом запросе
 * Мы получаем токен через API и используем его в заголовках
 */

let csrfTokenCache = null;
let csrfTokenPromise = null;

/**
 * Получить CSRF token из cookie (если доступен)
 */
export const getCsrfTokenFromCookie = () => {
  if (typeof document === 'undefined') {
    console.log('🛡️ [csrfToken.getCsrfTokenFromCookie] document is undefined (SSR)');
    return null;
  }
  
  console.log('🛡️ [csrfToken.getCsrfTokenFromCookie] Проверяем cookie...');
  // Django устанавливает cookie с именем 'csrftoken'
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  console.log('🛡️ [csrfToken.getCsrfTokenFromCookie] Все cookies:', document.cookie);
  
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      const token = decodeURIComponent(value);
      console.log('🛡️ [csrfToken.getCsrfTokenFromCookie] Token найден в cookie:', `${token.substring(0, 20)}...`);
      return token;
    }
  }
  
  console.log('🛡️ [csrfToken.getCsrfTokenFromCookie] Token в cookie не найден');
  return null;
};

/**
 * Получить CSRF token через API
 * Использует кеширование и single-flight для предотвращения множественных запросов
 */
export const getCsrfToken = async (api) => {
  console.log('🛡️ [csrfToken.getCsrfToken] === START ===');
  console.log('🛡️ [csrfToken.getCsrfToken] Time:', new Date().toISOString());
  
  // Если токен уже в кеше, возвращаем его
  if (csrfTokenCache) {
    console.log('🛡️ [csrfToken.getCsrfToken] Token из кеша:', `${csrfTokenCache.substring(0, 20)}...`);
    return csrfTokenCache;
  }
  
  // Если запрос уже в процессе, ждем его
  if (csrfTokenPromise) {
    console.log('🛡️ [csrfToken.getCsrfToken] Запрос уже в процессе, ждем...');
    return csrfTokenPromise;
  }
  
  // Сначала пробуем получить из cookie
  console.log('🛡️ [csrfToken.getCsrfToken] Шаг 1: Проверяем cookie...');
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    console.log('🛡️ [csrfToken.getCsrfToken] Шаг 1: Token найден в cookie:', `${cookieToken.substring(0, 20)}...`);
    csrfTokenCache = cookieToken;
    return cookieToken;
  }
  
  console.log('🛡️ [csrfToken.getCsrfToken] Шаг 1: Token в cookie не найден');
  console.log('🛡️ [csrfToken.getCsrfToken] Шаг 2: Запрашиваем через API GET /users/csrf/');
  
  // Если в cookie нет, запрашиваем через API
  csrfTokenPromise = api.get('/users/csrf/')
    .then((response) => {
      console.log('🛡️ [csrfToken.getCsrfToken] Шаг 2: Ответ получен:', {
        status: response.status,
        hasToken: !!response.data?.csrfToken
      });
      
      const token = response.data?.csrfToken;
      if (token) {
        console.log('🛡️ [csrfToken.getCsrfToken] Шаг 3: Token получен, сохраняем в кеш:', `${token.substring(0, 20)}...`);
        csrfTokenCache = token;
        console.log('🛡️ [csrfToken.getCsrfToken] === SUCCESS ===');
        return token;
      }
      console.error('🛡️ [csrfToken.getCsrfToken] Шаг 3: Token не получен в ответе!');
      throw new Error('CSRF token not received');
    })
    .catch((error) => {
      console.error('🛡️ [csrfToken] Failed to get CSRF token:', error);
      console.error('🛡️ [csrfToken] Error status:', error.response?.status);
      console.error('🛡️ [csrfToken] Error data:', error.response?.data);
      csrfTokenPromise = null;
      throw error;
    });
  
  return csrfTokenPromise;
};

/**
 * Очистить кеш CSRF token
 * Используется при logout или при ошибках аутентификации
 */
export const clearCsrfToken = () => {
  console.log('🛡️ [csrfToken.clearCsrfToken] Очищаем CSRF token кеш...');
  console.log('🛡️ [csrfToken.clearCsrfToken] Cache before:', csrfTokenCache ? `${csrfTokenCache.substring(0, 20)}...` : 'NULL');
  csrfTokenCache = null;
  csrfTokenPromise = null;
  console.log('🛡️ [csrfToken.clearCsrfToken] Cache cleared');
};

/**
 * Получить CSRF token синхронно (из кеша или cookie)
 * Возвращает null если токен еще не получен
 */
export const getCsrfTokenSync = () => {
  console.log('🛡️ [csrfToken.getCsrfTokenSync] Получаем CSRF token синхронно...');
  const fromCache = csrfTokenCache;
  const fromCookie = getCsrfTokenFromCookie();
  const result = fromCache || fromCookie;
  console.log('🛡️ [csrfToken.getCsrfTokenSync] Result:', {
    fromCache: !!fromCache,
    fromCookie: !!fromCookie,
    result: result ? `${result.substring(0, 20)}...` : 'NULL'
  });
  return result;
};

