// Утиліти для обробки помилок аутентифікації
import { isTechnicalError, cleanErrorMessage } from '../../utils/errorHandler';

export const AUTH_ERROR_MESSAGES = {
  // Ошибки входа
  login: {
    invalid_credentials: 'Невірний логін або пароль',
    account_disabled: 'Обліковий запис деактивовано',
    account_locked: 'Обліковий запис заблоковано',
    too_many_attempts: 'Занадто багато спроб входу. Спробуйте пізніше',
    network_error: 'Помилка з\'єднання з сервером',
    server_error: 'Помилка сервера. Спробуйте пізніше'
  },
  
  // Ошибки регистрации
  register: {
    username_taken: 'Такий логін вже існує',
    email_taken: 'Така пошта вже зареєстрована',
    weak_password: 'Пароль занадто простий',
    invalid_email: 'Невірний формат пошти',
    validation_error: 'Перевірте правильність введених даних'
  },
  
  // Ошибки токенов
  token: {
    expired: 'Сесія закінчилася. Увійдіть знову',
    invalid: 'Невірний токен авторизації',
    refresh_failed: 'Не вдалося оновити сесію. Увійдіть знову',
    network_error: 'Помилка з\'єднання при оновленні сесії'
  },
  
  // Общие ошибки
  general: {
    unauthorized: 'Необхідна авторизація',
    forbidden: 'Доступ заборонено',
    not_found: 'Сторінку не знайдено',
    server_error: 'Помилка сервера',
    network_error: 'Помилка з\'єднання з сервером'
  }
};

/**
 * Отримує повідомлення про помилку аутентифікації
 * @param {string} category - Категорія помилки (login, register, token, general)
 * @param {string} code - Код помилки
 * @returns {string} Повідомлення про помилку
 */
export const getAuthErrorMessage = (category, code) => {
  return AUTH_ERROR_MESSAGES[category]?.[code] || AUTH_ERROR_MESSAGES.general.server_error;
};

/**
 * Обробляє помилки аутентифікації та повертає користувацьке повідомлення
 * @param {Error} error - Об'єкт помилки
 * @returns {string} Користувацьке повідомлення про помилку
 */
export const handleAuthError = (error) => {
  console.error('Auth Error:', error);

  // Если это строка — тоже санитизируем (на случай "Error: ..." и т.п.)
  if (typeof error === 'string') {
    return cleanErrorMessage(error);
  }

  // Если это объект ошибки
  if (error instanceof Error) {
    const response = error.response;
    const request = error.request;
    
    // Ошибки от сервера
    if (response) {
      const status = response.status;
      const data = response.data;
      
      // Приоритет серверным сообщениям
      if (data?.detail) {
        return cleanErrorMessage(data.detail);
      }
      
      if (data?.message) {
        return cleanErrorMessage(data.message);
      }
      
      if (data?.error) {
        return cleanErrorMessage(data.error);
      }
      
      // Fallback на строковые и массивные ответы
      if (typeof data === 'string') {
        return cleanErrorMessage(data);
      }
      
      if (Array.isArray(data) && data.length > 0) {
        return cleanErrorMessage(data[0]);
      }
      
      // Коды статусов
      switch (status) {
        case 400:
          if (data?.non_field_errors && data.non_field_errors.length > 0) {
            return cleanErrorMessage(data.non_field_errors[0]);
          }
          return 'Невірні дані для входу';
          
        case 401:
          return getAuthErrorMessage('login', 'invalid_credentials');
          
        case 403:
          return getAuthErrorMessage('general', 'forbidden');
          
        case 404:
          return getAuthErrorMessage('general', 'not_found');
          
        case 429:
          return getAuthErrorMessage('login', 'too_many_attempts');
          
        case 500:
          return getAuthErrorMessage('general', 'server_error');
          
        default:
          return getAuthErrorMessage('general', 'server_error');
      }
    }
    
    // Сетевые ошибки
    if (request && !response) {
      return getAuthErrorMessage('general', 'network_error');
    }
    
    // Другие ошибки
    if (error.message) {
      return isTechnicalError(error.message)
        ? getAuthErrorMessage('general', 'server_error')
        : cleanErrorMessage(error.message);
    }
  }
  
  // Если это объект
  if (error && typeof error === 'object') {
    if (error.detail) return cleanErrorMessage(error.detail);
    if (error.message) return cleanErrorMessage(error.message);
    if (error.error) return cleanErrorMessage(error.error);
  }
  
  return getAuthErrorMessage('general', 'server_error');
};
