import axios from 'axios';
import { handleAuthError } from './utils/authErrorUtils';
import { API_URL } from '../api/instance';

class TokenService {
    constructor() {
        this.refreshPromise = null;
        this.tokenCheckInterval = null;
        this.startTokenMonitoring();
    }

    // Получить актуальный токен (с автоматическим обновлением)
    async getValidToken() {
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refresh');
        
        if (!token || !refreshToken) {
            throw new Error('Токени не знайдені');
        }

        // Проверяем, не истек ли токен
        if (this.isTokenExpired(token)) {
            console.log('Токен застарів, оновлюємо...');
            return await this.refreshToken(refreshToken);
        }

        return token;
    }

    // Проверка срока действия токена
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            const bufferTime = 300; // 5 минут буфера для надежности
            
            return payload.exp < (currentTime + bufferTime);
        } catch (error) {
            console.error('Помилка перевірки токена:', error);
            return true; // В случае ошибки считаем токен недействительным
        }
    }

    // Обновление токена
    async refreshToken(refreshToken) {
        if (this.refreshPromise) {
            return await this.refreshPromise;
        }

        this.refreshPromise = (async () => {
            try {
                console.log('Оновлюємо токен...');
                const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;
                if (!access) {
                    throw new Error('Немає access токена в відповіді');
                }

                localStorage.setItem('token', access);
                console.log('Токен успішно оновлено');
                return access;

            } catch (error) {
                console.error('Помилка оновлення токена:', error);
                // Очищаем токены при ошибке
                this.clearTokens();
                
                // Используем новую систему обработки ошибок
                const userMessage = handleAuthError(error);
                throw userMessage;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return await this.refreshPromise;
    }

    // Проверка валидности токенов без обновления
    async validateTokens() {
        try {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refresh');
            
            if (!token || !refreshToken) {
                return false;
            }

            if (this.isTokenExpired(token)) {
                // Пытаемся обновить токен
                await this.refreshToken(refreshToken);
                return true;
            }

            return true;
        } catch (error) {
            console.error('Помилка валідації токенів:', error);
            return false;
        }
    }

    // Мониторинг токенов
    startTokenMonitoring() {
        // Проверяем токены каждые 4 минуты
        this.tokenCheckInterval = setInterval(async () => {
            try {
                await this.validateTokens();
            } catch (error) {
                console.error('Помилка автоматичного оновлення токена:', error);
            }
        }, 4 * 60 * 1000); // 4 минуты
    }

    // Остановка мониторинга
    stopTokenMonitoring() {
        if (this.tokenCheckInterval) {
            clearInterval(this.tokenCheckInterval);
            this.tokenCheckInterval = null;
        }
    }

    // Очистка токенов
    clearTokens() {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');
        this.stopTokenMonitoring();
    }
}

export default new TokenService();
