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
  if (typeof document === 'undefined') return null;
  
  // Django устанавливает cookie с именем 'csrftoken'
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  
  for (let cookie of cookies) {
    const [key, value] = cookie.trim().split('=');
    if (key === name) {
      return decodeURIComponent(value);
    }
  }
  
  return null;
};

/**
 * Получить CSRF token через API
 * Использует кеширование и single-flight для предотвращения множественных запросов
 */
export const getCsrfToken = async (api) => {
  // Если токен уже в кеше, возвращаем его
  if (csrfTokenCache) {
    return csrfTokenCache;
  }
  
  // Если запрос уже в процессе, ждем его
  if (csrfTokenPromise) {
    return csrfTokenPromise;
  }
  
  // Сначала пробуем получить из cookie
  const cookieToken = getCsrfTokenFromCookie();
  if (cookieToken) {
    csrfTokenCache = cookieToken;
    return cookieToken;
  }
  
  // Если в cookie нет, запрашиваем через API
  csrfTokenPromise = api.get('/users/csrf/')
    .then((response) => {
      const token = response.data?.csrfToken;
      if (token) {
        csrfTokenCache = token;
        return token;
      }
      throw new Error('CSRF token not received');
    })
    .catch((error) => {
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
  csrfTokenCache = null;
  csrfTokenPromise = null;
};

/**
 * Получить CSRF token синхронно (из кеша или cookie)
 * Возвращает null если токен еще не получен
 */
export const getCsrfTokenSync = () => {
  return csrfTokenCache || getCsrfTokenFromCookie();
};

