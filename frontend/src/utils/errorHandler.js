// Універсальні утиліти для обробки помилок

/**
 * Перевіряє, чи є помилка технічною (JavaScript/Webpack)
 * @param {string} message - Повідомлення про помилку
 * @returns {boolean} true якщо помилка технічна
 */
export const isTechnicalError = (message) => {
  if (typeof message !== 'string') return false;
  
  const technicalPatterns = [
    /_WEBPACK_IMPORTED_MODULE_/,
    /\s+at\s.+/,
    /^TypeError:/,
    /^ReferenceError:/,
    /^SyntaxError:/,
    /^Error:/,
    /\.js:\d+:\d+/,
    /react-dom\.development\.js/,
    /webpack_require/,
    /__webpack_require__/,
    /invokePassiveEffectMountInDEV/,
    /commitHookEffectListMount/,
    /flushPassiveEffectsImpl/
  ];
  
  return technicalPatterns.some(pattern => pattern.test(message));
};

/**
 * Очищує технічні деталі з повідомлення про помилку
 * @param {string} message - Повідомлення про помилку
 * @returns {string} Очищене повідомлення
 */
export const cleanErrorMessage = (message) => {
  if (typeof message !== 'string') return message;
  
  // Видаляємо стек-трейси
  let cleaned = message.replace(/\s+at\s.+/g, '');
  
  // Видаляємо Webpack модулі
  cleaned = cleaned.replace(/_WEBPACK_IMPORTED_MODULE_.+$/, '');
  
  // Видаляємо номери строк
  cleaned = cleaned.replace(/\.js:\d+:\d+/g, '');
  
  // Видаляємо технічні префікси
  cleaned = cleaned.replace(/^(TypeError|ReferenceError|SyntaxError|Error):\s*/g, '');
  
  // Обмежуємо довжину
  const MAX_LENGTH = 200;
  if (cleaned.length > MAX_LENGTH) {
    cleaned = cleaned.slice(0, MAX_LENGTH - 1) + '…';
  }
  
  return cleaned.trim();
};

/**
 * Отримує користувацьке повідомлення про помилку з об'єкта помилки
 * @param {Error|Object|string} error - Об'єкт помилки
 * @param {string} fallback - Запасне повідомлення
 * @returns {string} Користувацьке повідомлення
 */
export const extractUserMessage = (error, fallback = 'Сталася помилка') => {
  // Якщо це вже строка
  if (typeof error === 'string') {
    return isTechnicalError(error) ? fallback : cleanErrorMessage(error);
  }
  
  // Якщо це Error об'єкт
  if (error instanceof Error) {
    const response = error.response;
    const request = error.request;
    
    // Приоритет серверним повідомленням
    if (response?.data) {
      const d = response.data;
      const serverMsg = 
        d.detail || d.message || d.error || d.non_field_errors?.[0] ||
        (typeof d === 'string' ? d : null) ||
        (Array.isArray(d) ? d[0] : null);
      
      if (serverMsg) return cleanErrorMessage(serverMsg);
    }
    
    // Коди статусів
    if (response?.status) {
      const status = response.status;
      if (status === 400) return 'Невірні дані';
      if (status === 401) return 'Необхідна авторизація';
      if (status === 403) return 'Доступ заборонено';
      if (status === 404) return 'Нічого не знайдено';
      if (status >= 500) return 'Помилка сервера. Спробуйте пізніше';
    }
    
    // Мережеві помилки
    if (request && !response) {
      return 'Помилка з\'єднання з сервером';
    }
    
    // Повідомлення з Error об'єкта
    if (error.message && !isTechnicalError(error.message)) {
      return cleanErrorMessage(error.message);
    }
  }
  
  // Якщо це об'єкт
  if (error && typeof error === 'object') {
    const userMsg = 
      error.detail ||
      error.message ||
      error.error ||
      error.msg;
    
    if (userMsg && !isTechnicalError(userMsg)) {
      return cleanErrorMessage(userMsg);
    }
  }
  
  return fallback;
};

/**
 * Безпечно показує помилку користувачу
 * @param {Function} toastFunction - Функція для показу повідомлення (наприклад, toast.error)
 * @param {Error|Object|string} error - Об'єкт помилки
 * @param {string} fallback - Запасне повідомлення
 */
export const showUserError = (toastFunction, error, fallback = 'Сталася помилка') => {
  if (typeof toastFunction === 'function') {
    const userMessage = extractUserMessage(error, fallback);
    toastFunction(userMessage);
  } else {
    console.error('Toast function not provided');
  }
};

/**
 * Логує помилку для розробників (тільки в консоль)
 * @param {string} context - Контекст помилки
 * @param {Error|Object|string} error - Об'єкт помилки
 */
export const logDeveloperError = (context, error) => {
  console.error(`[${context}] Developer Error:`, error);
  
  // Додаткова інформація для розробників
  if (error instanceof Error) {
    console.error('Stack trace:', error.stack);
  }
};
