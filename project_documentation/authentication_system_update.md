# Обновление системы авторизации

## Что изменилось

### Backend (Django)
1. **Настройки SIMPLE_JWT**:
   - `ACCESS_TOKEN_LIFETIME`: 15 минут (было 60)
   - `REFRESH_TOKEN_LIFETIME`: 7 дней
   - `LEEWAY`: 120 секунд (было 0)
   - `AUTH_HEADER_TYPES`: только 'Bearer'

2. **Новые endpoints**:
   - `POST /users/refresh/` - обновление токенов через cookie
   - Обновленные `POST /users/login/` и `POST /users/logout/`

3. **Cookie-based refresh**:
   - Refresh токен хранится в HttpOnly cookie
   - Автоматическая ротация refresh токенов
   - CSRF защита через `X-Requested-With` заголовок

### Frontend (React)
1. **Хранение токенов**:
   - Access токен: только в памяти (не localStorage)
   - Refresh токен: только в HttpOnly cookie (не доступен JS)

2. **Автоматическое обновление**:
   - При каждом API запросе проверяется валидность access токена
   - При истечении < 90 секунд автоматически обновляется через refresh
   - При загрузке/фокусе/видимости страницы

3. **Новые компоненты**:
   - `useAuthBootstrap` - хук для автообновления токенов
   - Обновленный `tokenService` для работы с памятью

## Как использовать

### 1. Добавить bootstrap хук в корневой компонент

```jsx
// В App.jsx или главном компоненте
import useAuthBootstrap from './auth/hooks/useAuthBootstrap';

function App() {
  useAuthBootstrap(); // Добавить эту строку
  
  return (
    // ваш JSX
  );
}
```

### 2. Обновить API вызовы

Все API вызовы теперь автоматически:
- Отправляют cookies (`withCredentials: true`)
- Обновляют токены при необходимости
- Обрабатывают 401 ошибки

### 3. Логин/Логаут

```javascript
// Логин
const { data } = await authService.login({ username, password });
// data.access - новый access токен
// refresh токен автоматически сохранен в cookie

// Логаут
await authService.logout();
// Все токены очищены
```

## Безопасность

1. **Refresh токен**:
   - HttpOnly cookie (недоступен JavaScript)
   - Secure в продакшене
   - SameSite=Lax для same-site, None для cross-site
   - Автоматическая ротация при каждом обновлении

2. **Access токен**:
   - Только в памяти (исчезает при закрытии вкладки)
   - Короткий срок жизни (15 минут)
   - Автоматическое обновление

3. **CSRF защита**:
   - Требуется `X-Requested-With: XMLHttpRequest` заголовок
   - CORS настройки для точных доменов

## Мониторинг

Система автоматически:
- Обновляет токены при активности пользователя
- Логаутит при невалидном refresh токене
- Синхронизирует состояние между вкладками
- Обрабатывает сетевые ошибки

## Отладка

В development режиме включено подробное логирование:
- Проверка условий в useAuth
- Обновление токенов
- Ошибки авторизации

## Миграция

Существующий код должен работать без изменений, но рекомендуется:
1. Добавить `useAuthBootstrap` в корневой компонент
2. Убрать ручные проверки localStorage для токенов
3. Обновить обработку ошибок авторизации
