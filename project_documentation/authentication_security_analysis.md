# Детальный анализ системы аутентификации и безопасности

## Дата анализа: 2025-11-08

---

## 1. АРХИТЕКТУРА ТОКЕНОВ

### 1.1. Access Token (JWT)
- **Хранение**: В памяти JavaScript (`tokenService.js`)
- **Передача**: В заголовке `Authorization: Bearer <token>`
- **TTL**: Определяется в JWT payload (обычно 15-30 минут)
- **Обновление**: Автоматически через refresh endpoint при истечении
- **CSRF защита**: НЕ НУЖНА (токен в заголовке, не в cookie)

### 1.2. Refresh Token (JWT)
- **Хранение**: HttpOnly cookie (`refresh_token`)
- **Передача**: Автоматически браузером с каждым запросом к домену
- **TTL**: 7 дней (REFRESH_MAX_AGE = 60 * 60 * 24 * 7)
- **Параметры cookie**:
  - `httponly=True` - недоступен из JavaScript
  - `secure=True` (в продакшене) - только HTTPS
  - `samesite=Lax` (по умолчанию) - защита от CSRF
  - `path=/` - доступен для всего сайта
- **CSRF защита**: ОБЯЗАТЕЛЬНА (токен в cookie)

---

## 2. КОМПОНЕНТЫ СИСТЕМЫ

### 2.1. Backend (Django)

#### Файлы:
- `backend/apps/users/api/views.py` - основные view для аутентификации
- `backend/apps/users/api/urls.py` - маршруты
- `backend/apps/users/models.py` - модели User и Profile
- `backend/apps/api/exc_handlers.py` - обработка исключений

#### Endpoints:

**1. `/api/users/register/` (RegisterView)**
- Метод: POST
- CSRF: `@csrf_exempt` ✅ ДОПУСТИМО
- Причина: Принимает только логин/пароль, не использует cookie для аутентификации
- Действия:
  - Создает пользователя
  - Генерирует access и refresh токены
  - Устанавливает refresh в HttpOnly cookie
  - Возвращает access в теле ответа

**2. `/api/users/login/` (LoginView)**
- Метод: POST
- CSRF: `@csrf_exempt` ✅ ДОПУСТИМО
- Причина: Принимает только логин/пароль, не использует cookie для аутентификации
- Действия:
  - Аутентифицирует пользователя
  - Генерирует access и refresh токены
  - Устанавливает refresh в HttpOnly cookie
  - Возвращает access в теле ответа

**3. `/api/users/refresh/` (CookieTokenRefreshView)**
- Метод: POST
- CSRF: `@csrf_exempt` ❌ УЯЗВИМОСТЬ!
- Текущая защита: Проверка заголовка `X-Requested-With: XMLHttpRequest`
- Проблема: Заголовок `X-Requested-With` легко подделать, это слабая защита
- Действия:
  - Читает refresh токен из cookie
  - Ротирует токены (старый в blacklist, новый выдает)
  - Устанавливает новый refresh в cookie
  - Возвращает новый access в теле ответа
- **Риск CSRF**: Злоумышленник может со своего сайта вызвать этот endpoint из браузера жертвы

**4. `/api/users/logout/` (LogoutView)**
- Метод: POST
- CSRF: `@csrf_exempt` ❌ УЯЗВИМОСТЬ!
- Действия:
  - Читает refresh токен из cookie
  - Добавляет токен в blacklist
  - Удаляет refresh cookie
- **Риск CSRF**: Злоумышленник может вылогинить пользователя

**5. `/api/users/profile/` (UserProfileView)**
- Метод: GET
- CSRF: Не требуется (GET запрос)
- Аутентификация: JWT через заголовок Authorization
- Действия: Возвращает профиль пользователя

### 2.2. Frontend (React)

#### Файлы:
- `frontend/src/auth/tokenService.js` - управление access токеном в памяти
- `frontend/src/api/instance.js` - axios interceptor для автоматического refresh
- `frontend/src/auth/authService.js` - сервис для API вызовов
- `frontend/src/auth/authSlice.js` - Redux store для состояния аутентификации
- `frontend/src/auth/hooks/useAuth.js` - хук для загрузки профиля
- `frontend/src/auth/hooks/useAuthBootstrap.js` - хук для bootstrap refresh

#### Компоненты:
- `frontend/src/auth/components/LoginModal.js` - форма входа
- `frontend/src/auth/components/RegisterModal.js` - форма регистрации
- `frontend/src/auth/components/PrivateRoute.jsx` - защита маршрутов

---

## 3. ПОТОКИ АУТЕНТИФИКАЦИИ

### 3.1. Регистрация нового пользователя

**Этапы:**
1. Пользователь заполняет форму в `RegisterModal.js`
2. Вызывается `authService.register(userData)` → `POST /api/users/register/`
3. Backend (`RegisterView`):
   - Валидирует данные через `CreateUserSerializer`
   - Создает пользователя
   - Генерирует `RefreshToken.for_user(user)`
   - Устанавливает refresh в HttpOnly cookie через `set_refresh_cookie()`
   - Возвращает `{user, access}` в теле ответа
4. Frontend (`authService.register`):
   - Сохраняет access токен в память через `tokenService.setAccess(data.access)`
   - Возвращает данные в Redux
5. Redux (`authSlice.register.fulfilled`):
   - Сохраняет user в state
   - НЕ устанавливает `isAuthenticated` (ждет загрузки профиля)

**Файлы:**
- `RegisterModal.js` → `authSlice.register` → `authService.register` → `RegisterView`

### 3.2. Вход существующего пользователя

**Этапы:**
1. Пользователь заполняет форму в `LoginModal.js`
2. Вызывается `authService.login(userData)` → `POST /api/users/login/`
3. Backend (`LoginView`):
   - Аутентифицирует через `authenticate(request, username, password)`
   - Генерирует `RefreshToken.for_user(user)`
   - Устанавливает refresh в HttpOnly cookie
   - Возвращает `{access}` в теле ответа
4. Frontend (`authService.login`):
   - Сохраняет access токен в память через `tokenService.setAccess(data.access)`
5. Redux (`authSlice.login.fulfilled`):
   - Устанавливает `hasToken = true`
   - НЕ устанавливает `isAuthenticated` (ждет загрузки профиля)
6. `LoginModal.js` вызывает `dispatch(getProfile())`
7. `getProfile()` → `GET /api/users/profile/` с заголовком `Authorization: Bearer <access>`
8. Backend возвращает профиль
9. Redux (`authSlice.getProfile.fulfilled`):
   - Сохраняет `userInfo`
   - Устанавливает `isAuthenticated = true`
   - Сохраняет в `localStorage`

**Файлы:**
- `LoginModal.js` → `authSlice.login` → `authService.login` → `LoginView`
- `LoginModal.js` → `authSlice.getProfile` → `authService.getProfile` → `UserProfileView`

### 3.3. Автоматическое обновление токенов

#### 3.3.1. Через axios interceptor (`instance.js`)

**Сценарий:** Любой API запрос получает 401 Unauthorized

**Этапы:**
1. `api.interceptors.response` перехватывает 401
2. Проверяет, что это не auth endpoint
3. Проверяет, что запрос еще не был повторен (`original._retry`)
4. Вызывает `api.post('/users/refresh/', {})` с `withCredentials: true`
   - Браузер автоматически отправляет refresh cookie
5. Backend (`CookieTokenRefreshView`):
   - Проверяет `X-Requested-With: XMLHttpRequest` (слабая CSRF защита)
   - Читает refresh из cookie
   - Ротирует токены (старый в blacklist, новый выдает)
   - Устанавливает новый refresh в cookie
   - Возвращает новый access
6. Frontend:
   - Сохраняет новый access в память через `token.set(newAccess)`
   - Повторяет оригинальный запрос с новым токеном

**Файлы:**
- `instance.js` (interceptor) → `CookieTokenRefreshView`

#### 3.3.2. Через useAuthBootstrap

**Сценарий:** Загрузка страницы, фокус на окно, изменение видимости

**Этапы:**
1. `useAuthBootstrap` вызывается в корневом компоненте
2. При монтировании, фокусе, visibility change:
   - Вызывает `api.post('/users/refresh/', null, {headers: {'X-Requested-With': 'XMLHttpRequest'}})`
3. Backend обрабатывает как в 3.3.1
4. Frontend:
   - Сохраняет access в память
   - Устанавливает `hasToken = true` в Redux

**Файлы:**
- `useAuthBootstrap.js` → `CookieTokenRefreshView`

### 3.4. Загрузка профиля при наличии токена

**Сценарий:** Пользователь открывает сайт, у него есть refresh cookie

**Этапы:**
1. `App.jsx` при монтировании:
   - Проверяет `localStorage.getItem('token')` (устаревший способ)
   - Если есть, вызывает `dispatch(getProfile())`
2. `useAuth` хук:
   - Проверяет `tokenService.hasAccess()` (токен в памяти)
   - Если токена нет, но есть refresh cookie → bootstrap refresh
   - Если токен есть, но нет `userInfo` → вызывает `getProfile()`
3. `getProfile()` → `GET /api/users/profile/` с `Authorization: Bearer <access>`
4. Backend возвращает профиль
5. Redux обновляет состояние

**Файлы:**
- `App.jsx` → `useAuth.js` → `authSlice.getProfile` → `UserProfileView`

### 3.5. Выход из системы

**Этапы:**
1. Пользователь нажимает "Выход"
2. Вызывается `authService.logout()` → `POST /api/users/logout/`
3. Backend (`LogoutView`):
   - Читает refresh из cookie
   - Добавляет в blacklist
   - Удаляет refresh cookie через `del_refresh_cookie()`
4. Frontend:
   - Очищает access токен из памяти через `tokenService.clear()`
5. Redux (`authSlice.logout.fulfilled`):
   - Очищает все данные пользователя
   - Устанавливает `isAuthenticated = false`
   - Удаляет из `localStorage`

**Файлы:**
- Компонент выхода → `authSlice.logout` → `authService.logout` → `LogoutView`

---

## 4. СЦЕНАРИИ ИСПОЛЬЗОВАНИЯ

### 4.1. Пользователь онлайн постоянно

**Поведение:**
- Access токен обновляется автоматически через interceptor при 401
- Refresh токен ротируется при каждом refresh
- Профиль загружается один раз при входе
- `useAuthBootstrap` периодически обновляет токен при фокусе/видимости

### 4.2. Пользователь не заходил 1 день

**Поведение:**
- Refresh cookie еще валидна (TTL = 7 дней)
- При открытии сайта:
  1. `useAuthBootstrap` вызывает refresh
  2. Получает новый access токен
  3. `useAuth` загружает профиль
  4. Пользователь авторизован

### 4.3. Пользователь не заходил 3 дня

**Поведение:**
- Refresh cookie еще валидна (TTL = 7 дней)
- Поведение аналогично 4.2

### 4.4. Пользователь не заходил 7+ дней

**Поведение:**
- Refresh cookie истекла
- При открытии сайта:
  1. `useAuthBootstrap` пытается refresh → 401
  2. `hasToken = false`
  3. Пользователь остается гостем
  4. Нужен повторный вход

### 4.5. Компьютер во сне, вкладка открыта (1-2 дня)

**Поведение:**
- Access токен в памяти истек
- Refresh cookie валидна
- При пробуждении/активации вкладки:
  1. `useAuthBootstrap` срабатывает на `visibilitychange`
  2. Вызывает refresh
  3. Получает новый access токен
  4. Пользователь остается авторизованным

### 4.6. Компьютер во сне, вкладка открыта (7+ дней)

**Поведение:**
- Refresh cookie истекла
- При пробуждении:
  1. `useAuthBootstrap` пытается refresh → 401
  2. Пользователь разлогинен
  3. Нужен повторный вход

---

## 5. ПРОБЛЕМЫ БЕЗОПАСНОСТИ

### 5.1. CSRF уязвимости

#### ❌ Проблема 1: CookieTokenRefreshView
- **Текущее состояние**: `@csrf_exempt` + проверка `X-Requested-With`
- **Проблема**: Заголовок `X-Requested-With` легко подделать
- **Риск**: Злоумышленник может со своего сайта вызвать refresh и получить access токен жертвы
- **Решение**: Убрать `@csrf_exempt`, использовать Django CSRF token

#### ❌ Проблема 2: LogoutView
- **Текущее состояние**: `@csrf_exempt`
- **Проблема**: Нет защиты от CSRF
- **Риск**: Злоумышленник может вылогинить пользователя
- **Решение**: Убрать `@csrf_exempt`, использовать Django CSRF token

### 5.2. Правильная защита от CSRF

**Для endpoints с cookie:**
1. Убрать `@csrf_exempt`
2. Получать CSRF token через `GET /api/csrf/` или из cookie
3. Отправлять CSRF token в заголовке `X-CSRFToken` или в теле запроса
4. Django автоматически проверит токен через `CsrfViewMiddleware`

**Альтернатива (для API):**
- Использовать `SameSite=Strict` для refresh cookie (но это может сломать cross-origin запросы)
- Использовать двойную отправку cookie (Double Submit Cookie)

---

## 6. РЕКОМЕНДАЦИИ ПО ИСПРАВЛЕНИЮ

### 6.1. Немедленные исправления

1. **Убрать `@csrf_exempt` из `CookieTokenRefreshView`**
   - Добавить получение CSRF token на фронтенде
   - Отправлять CSRF token в заголовке `X-CSRFToken`

2. **Убрать `@csrf_exempt` из `LogoutView`**
   - Аналогично refresh endpoint

3. **Оставить `@csrf_exempt` для `LoginView` и `RegisterView`**
   - Эти endpoints не используют cookie для аутентификации
   - CSRF защита не критична (максимум - залогинить жертву)

### 6.2. Долгосрочные улучшения

1. **Добавить endpoint для получения CSRF token**
   - `GET /api/csrf/` - возвращает CSRF token
   - Фронтенд получает при загрузке и использует для всех POST запросов

2. **Использовать `SameSite=Strict` для refresh cookie**
   - Дополнительная защита от CSRF
   - Проверить совместимость с cross-origin запросами

3. **Добавить rate limiting для refresh endpoint**
   - Уже есть через `throttle_scope = "auth_refresh"` (30/min)
   - Это хорошо

---

## 7. ТЕКУЩЕЕ СОСТОЯНИЕ CSRF ЗАЩИТЫ

| Endpoint | Метод | Использует Cookie | CSRF защита | Статус |
|----------|-------|-------------------|-------------|--------|
| `/api/users/register/` | POST | Нет (только устанавливает) | `@csrf_exempt` | ✅ OK |
| `/api/users/login/` | POST | Нет (только устанавливает) | `@csrf_exempt` | ✅ OK |
| `/api/users/refresh/` | POST | Да (читает refresh) | `@csrf_exempt` + `X-Requested-With` | ❌ УЯЗВИМО |
| `/api/users/logout/` | POST | Да (читает refresh) | `@csrf_exempt` | ❌ УЯЗВИМО |
| `/api/users/profile/` | GET | Нет | Не требуется | ✅ OK |

---

## 8. ЗАКЛЮЧЕНИЕ

Пользователь **абсолютно прав** в своем анализе:

1. ✅ **Login/Register** - `@csrf_exempt` допустим (не используют cookie для аутентификации)
2. ❌ **Refresh** - `@csrf_exempt` + `X-Requested-With` = слабая защита, нужна полная CSRF защита
3. ❌ **Logout** - `@csrf_exempt` = уязвимость, нужна CSRF защита

**Формула верна:**
- JWT в заголовке → CSRF не нужен ✅
- JWT в cookie → CSRF обязателен ❌ (сейчас не реализовано правильно)

**Приоритет исправлений:**
1. Высокий: Исправить CSRF защиту для `/api/users/refresh/`
2. Средний: Исправить CSRF защиту для `/api/users/logout/`
3. Низкий: Оставить как есть для `/api/users/login/` и `/api/users/register/`

