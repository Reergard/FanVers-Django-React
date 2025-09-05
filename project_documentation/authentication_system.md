# Система аутентификации и авторизации

## Обзор

Система аутентификации FanVers построена на JWT токенах с автоматическим обновлением, интегрирована с Redux для управления состоянием и включает защиту от злоупотреблений через тротлинг.

## Архитектура

### Frontend (React + Redux)
- **Redux Store**: Централизованное управление состоянием авторизации
- **JWT Interceptors**: Автоматическое обновление токенов
- **Route Protection**: Защищенные маршруты с проверкой авторизации
- **Token Service**: Управление жизненным циклом токенов

### Backend (Django + DRF)
- **JWT Authentication**: SimpleJWT для токенов
- **Smart Throttling**: Интеллектуальное ограничение запросов
- **Permission System**: Система ролей и разрешений
- **Redis Cache**: Кеширование для тротлинга

## Компоненты системы

### 1. Redux Store (`store.js`)

```javascript
export const store = configureStore({
    reducer: {
        auth: authReducer,           // Состояние авторизации
        notification: notificationReducer,
        userSettings: userSettingsReducer,
    },
});
```

### 2. Auth Slice (`authSlice.js`)

**Состояние:**
```javascript
const initialState = {
    user: user ? user : null,
    userInfo: {},
    isAuthenticated: false,  // НЕ определяется по localStorage
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: "",
};
```

**Ключевые действия:**
- `login` - вход пользователя
- `logout` - выход пользователя
- `getProfile` - загрузка профиля
- `forceLogout` - принудительный выход
- `setIsAuthenticated` - установка статуса авторизации

**Логика авторизации:**
- `isAuthenticated` устанавливается только после успешной загрузки профиля
- При ошибке загрузки профиля проверяется наличие токена в localStorage
- Токены сохраняются в localStorage через `authService`

### 3. Token Service (`tokenService.js`)

**Основные функции:**
- `getValidToken()` - получение актуального токена с автообновлением
- `isTokenExpired()` - проверка срока действия токена
- `refreshToken()` - обновление токена
- `validateTokens()` - валидация токенов без обновления
- `startTokenMonitoring()` - мониторинг токенов каждые 4 минуты

**Автоматическое обновление:**
- Проверка токена перед каждым запросом
- Буферное время 5 минут для надежности
- Очередь обновления для предотвращения дублирования

### 4. Auth Service (`authService.js`)

**API методы:**
- `login()` - аутентификация с сохранением токенов
- `register()` - регистрация пользователя
- `getProfile()` - загрузка профиля с валидацией токена
- `logout()` - очистка токенов
- `checkTokens()` - проверка валидности токенов

### 5. UseAuth Hook (`useAuth.js`)

**Логика работы:**
1. **Публичные страницы**: Сброс авторизации для гостей
2. **Проверка токена**: Без токена - пропуск загрузки профиля
3. **Загрузка профиля**: Только при наличии токена и отсутствии userInfo
4. **Антиспам защита**: Минимальный интервал 1 секунда между запросами
5. **Повторные попытки**: Разрешение через 5 секунд после ошибки

**Условия загрузки профиля:**
```javascript
// Гейт №1: не грузим профиль на публичных роутах
if (isPublic) return;

// Гейт №2: без токена не дергаем API
if (!hasToken) return;

// Гейт №3: не спамим, если уже отправляли запрос
if (requestedRef.current) return;

// Гейт №4: минимальный интервал между запросами
if (timeSinceLastRequest < 1000) return;

// Гейт №5: загружаем только если нет userInfo
if (!userInfo || Object.keys(userInfo).length === 0) {
    // Загрузка профиля
}
```

### 6. Axios Interceptors (`instance.js`)

**Request Interceptor:**
- Автоматическая подстановка JWT токена в заголовок `Authorization: Bearer <token>`
- Исключение для FormData (удаление Content-Type)

**Response Interceptor:**
- Обработка 401 ошибок с автоматическим обновлением токена
- Очередь обновления для предотвращения дублирования
- Принудительный logout при неудачном обновлении
- Исключение для auth endpoints

**Логика обновления токена:**
```javascript
if (error.response?.status === 401 && !originalRequest._retry) {
    // Проверка наличия токенов
    if (!token && !refreshToken) {
        return Promise.reject(error); // Гость - просто ошибка
    }
    
    // Очередь обновления
    if (refreshPromise) {
        await refreshPromise;
    } else {
        refreshPromise = refreshToken();
    }
    
    // Повтор запроса с новым токеном
    return api(originalRequest);
}
```

## Система тротлинга

### 1. Smart Throttling (`smart_throttling.py`)

**Принцип работы:**
- Атомарный счетчик запросов через Redis
- Определение подозрительных запросов по User-Agent
- Порог: 120 запросов за 60 секунд
- TTL: 60 секунд

**Идентификация клиента:**
```python
def _client_ident(request):
    return BaseThrottle().get_ident(request)  # Учитывает X-Forwarded-For
```

### 2. DRF Throttling (`settings.py`)

**Настройки тротлинга:**
```python
'DEFAULT_THROTTLE_RATES': {
    'user': '240/min',      # Авторизованные пользователи
    'anon': '120/min',      # Анонимные пользователи
    'read_heavy': '240/min',   # Тяжелые страницы
    'read_light': '120/min',   # Легкие страницы
    'rating': '30/min',        # Голосование
    'analytics': '60/min',     # Аналитика
    'upload': '20/hour',       # Загрузки
    'purchase': '10/hour',     # Покупки
    'balance': '100/hour',     # Операции с балансом
    'profile': '1000/hour',    # Профили
}
```

### 3. Exception Handler (`exc_handlers.py`)

**Обработка 429 ошибок:**
- Детальная информация для фронтенда
- Заголовки `X-RateLimit-Reset` и `Retry-After`
- Логирование для мониторинга

## Безопасность

### 1. JWT Настройки
```python
SIMPLE_JWT = {
    'AUTH_HEADER_TYPES': ('Bearer', 'JWT'),
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
}
```

### 2. CORS Настройки
```python
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    "authorization", "content-type", "x-csrftoken",
    "x-requested-with", "x-request-id", "cache-control"
]
```

### 3. Proxy Настройки
```python
NUM_PROXIES = 1  # Количество прокси перед Django
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
```

## Мониторинг и диагностика

### 1. Логирование
- Все операции с токенами логируются
- Ошибки тротлинга записываются в лог
- Диагностическая информация в development режиме

### 2. Метрики
- Количество запросов по типам
- Частота обновления токенов
- Ошибки авторизации

### 3. Отладка
- Флаги для отслеживания состояния
- Детальные логи в useAuth
- Информация о запросах в консоли

## Потоки данных

### 1. Вход пользователя
```
Login Form → authService.login() → JWT токены → localStorage → Redux state → useAuth → getProfile() → isAuthenticated = true
```

### 2. Автоматическое обновление токена
```
API Request → 401 Error → refreshToken() → New JWT → localStorage → Retry Request
```

### 3. Выход пользователя
```
Logout → clearTokens() → localStorage.clear() → Redux reset → Redirect to login
```

### 4. Принудительный выход
```
401 Error → forceLogout() → clearTokens() → Redux reset → CustomEvent → useAuth cleanup
```

## Рекомендации по использованию

### 1. Для разработчиков
- Всегда используйте `useAuth` hook для проверки авторизации
- Не проверяйте `localStorage` напрямую
- Используйте `tokenService` для работы с токенами
- Обрабатывайте ошибки авторизации корректно

### 2. Для админов
- Мониторьте логи на предмет подозрительной активности
- Настройте алерты на частые 429 ошибки
- Регулярно проверяйте настройки тротлинга

### 3. Для пользователей
- Система автоматически обновляет токены
- При проблемах с авторизацией - перелогиниться
- Токены действительны 1 час, обновляются автоматически
