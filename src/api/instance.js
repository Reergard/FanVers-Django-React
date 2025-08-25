import axios from 'axios';

// Створюємо базовий екземпляр axios
const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Додаємо інтерцептор для запитів
instance.interceptors.request.use(
  (config) => {
    // Отримуємо токен з localStorage
    const token = localStorage.getItem('access_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Логуємо запит
    console.log('🚀 [API] Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      data: config.data,
      headers: config.headers,
    });
    
    return config;
  },
  (error) => {
    console.error('❌ [API] Request Error:', error);
    return Promise.reject(error);
  }
);

// Додаємо інтерцептор для відповідей
instance.interceptors.response.use(
  (response) => {
    // Логуємо успішну відповідь
    console.log('✅ [API] Response:', {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    
    return response;
  },
  (error) => {
    // Логуємо помилку
    console.error('❌ [API] Response Error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: error.response?.data,
    });

    // Обробляємо помилки авторизації
    if (error.response?.status === 401) {
      console.warn('🔐 [API] Unauthorized - clearing tokens');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Перенаправляємо на сторінку входу
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Обробляємо помилки з'єднання
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      console.error('🌐 Помилка з\'єднання з сервером:', error.message);
      return Promise.reject(error);
    }

    // Обробляємо помилки сервера
    if (error.response?.status >= 500) {
      console.error('🔥 [API] Server Error:', error.response.data);
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default instance;



