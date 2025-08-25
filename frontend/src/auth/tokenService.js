import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

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
            console.log('🔑 Токен застарів, оновлюємо...');
            return await this.refreshToken(refreshToken);
        }

        return token;
    }

    // Проверка срока действия токена
    isTokenExpired(token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            const bufferTime = 60; // 1 минута буфера
            
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
                console.log('🔄 Оновлюємо токен...');
                const response = await axios.post(`${API_URL}/auth/jwt/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;
                if (!access) {
                    throw new Error('Немає access токена в відповіді');
                }

                localStorage.setItem('token', access);
                console.log('✅ Токен успішно оновлено');
                return access;

            } catch (error) {
                console.error('❌ Помилка оновлення токена:', error);
                // Очищаем токены при ошибке
                localStorage.removeItem('token');
                localStorage.removeItem('refresh');
                throw error;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return await this.refreshPromise;
    }

    // Мониторинг токенов
    startTokenMonitoring() {
        // Проверяем токены каждые 5 минут
        this.tokenCheckInterval = setInterval(async () => {
            try {
                const token = localStorage.getItem('token');
                if (token && this.isTokenExpired(token)) {
                    console.log('🔑 Автоматичне оновлення застарілого токена...');
                    const refreshToken = localStorage.getItem('refresh');
                    if (refreshToken) {
                        await this.refreshToken(refreshToken);
                    }
                }
            } catch (error) {
                console.error('❌ Помилка автоматичного оновлення токена:', error);
            }
        }, 5 * 60 * 1000); // 5 минут
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
