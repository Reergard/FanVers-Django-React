// Утилита для ограничения частоты запросов
class RequestThrottle {
  constructor() {
    this.pendingRequests = new Map();
    this.lastRequestTime = new Map();
    this.requestCounts = new Map();
    
    // Настройки throttling
    this.MIN_INTERVAL = 100; // Минимальный интервал между запросами (мс)
    this.MAX_REQUESTS_PER_MINUTE = 30; // Максимум запросов в минуту
    this.RESET_INTERVAL = 60000; // Интервал сброса счетчика (мс)
  }

  // Проверяем, можно ли выполнить запрос
  canMakeRequest(key) {
    const now = Date.now();
    const lastTime = this.lastRequestTime.get(key) || 0;
    const timeSinceLastRequest = now - lastTime;
    
    // Проверяем минимальный интервал
    if (timeSinceLastRequest < this.MIN_INTERVAL) {
      return false;
    }
    
    // Проверяем количество запросов в минуту
    const requestCount = this.requestCounts.get(key) || 0;
    if (requestCount >= this.MAX_REQUESTS_PER_MINUTE) {
      return false;
    }
    
    return true;
  }

  // Обновляем статистику запросов
  updateRequestStats(key) {
    const now = Date.now();
    this.lastRequestTime.set(key, now);
    
    const currentCount = this.requestCounts.get(key) || 0;
    this.requestCounts.set(key, currentCount + 1);
    
    // Сбрасываем счетчик через минуту
    setTimeout(() => {
      this.requestCounts.delete(key);
    }, this.RESET_INTERVAL);
  }

  // Добавляем запрос с умным throttling
  addRequest(key, requestFn) {
    // Если запрос уже выполняется, ждем его завершения
    if (this.pendingRequests.has(key)) {
      console.log(`Request for ${key} is already pending, waiting for completion...`);
      return this.pendingRequests.get(key);
    }

    // Проверяем, можно ли выполнить запрос
    if (!this.canMakeRequest(key)) {
      console.log(`Request for ${key} is throttled, scheduling retry...`);
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(this.addRequest(key, requestFn));
        }, this.MIN_INTERVAL);
      });
    }

    // Обновляем статистику
    this.updateRequestStats(key);

    // Выполняем запрос
    const requestPromise = requestFn()
      .finally(() => {
        this.pendingRequests.delete(key);
      });

    this.pendingRequests.set(key, requestPromise);
    return requestPromise;
  }

  // Очищаем все запросы (для отладки)
  clear() {
    this.pendingRequests.clear();
    this.lastRequestTime.clear();
    this.requestCounts.clear();
  }

  // Получаем статистику для отладки
  getStats() {
    return {
      pendingRequests: this.pendingRequests.size,
      lastRequestTimes: Object.fromEntries(this.lastRequestTime),
      requestCounts: Object.fromEntries(this.requestCounts)
    };
  }
}

// Создаем глобальный экземпляр
export const requestThrottle = new RequestThrottle();

// Функция для создания уникального ключа запроса
export const createRequestKey = (bookSlug, ratingType, action = 'fetch') => {
  return `${action}_${bookSlug}_${ratingType}`;
};
