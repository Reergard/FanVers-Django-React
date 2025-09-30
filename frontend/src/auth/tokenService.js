// Простое in-memory хранилище access токена + TTL
let accessToken = null;
let accessExp = 0; // epoch seconds

const parseExp = (jwt) => {
  try {
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    return payload.exp || 0;
  } catch {
    return 0;
  }
};

class TokenService {
  setAccess(token) {
    accessToken = token || null;
    accessExp = token ? parseExp(token) : 0;
  }

  clear() {
    this.setAccess(null);
  }

  // Геттеры для проверки состояния токена
  getAccessSync() { 
    return accessToken; 
  }
  
  hasAccess() { 
    return !!accessToken; 
  }

  // Если access отсутствует или истекает < 90с — вызовет refreshFn (single-flight передают из instance.js)
  async getValidAccess(refreshFn) {
    const now = Math.floor(Date.now() / 1000);
    const almostExpired = !accessToken || accessExp - now < 90;
    if (almostExpired) {
      const newToken = await refreshFn();
      this.setAccess(newToken);
    }
    return accessToken;
  }

  // Проверка срока действия токена (для совместимости)
  isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      const bufferTime = 90; // 90 секунд буфера
      
      return payload.exp < (currentTime + bufferTime);
    } catch (error) {
      console.error('Помилка перевірки токена:', error);
      return true;
    }
  }

  // Очистка токенов (для совместимости)
  clearTokens() {
    this.clear();
  }

  // Остановка мониторинга (для совместимости - больше не нужен)
  stopTokenMonitoring() {
    // Больше не нужен при cookie-схеме
  }
}

export default new TokenService();
