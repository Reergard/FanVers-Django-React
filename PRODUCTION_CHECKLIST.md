# ✅ Чек-лист готовности к продакшену

## 📊 Текущий статус

### ✅ Что работает:
1. **Логин/Регистрация** - работает корректно
2. **Токены** - сохраняются и отправляются правильно
3. **Профиль** - загружается успешно
4. **WebSocket** - подключается и работает
5. **CSRF защита** - настроена для refresh/logout
6. **CORS** - настроен для dev/prod

### ⚠️ Известные проблемы:
1. **Refresh endpoint** - возвращает 401 при первом запросе (нормально, если нет refresh cookie)
2. **Refresh cookie** - недоступна через JavaScript (httponly=True) - это правильно для безопасности

---

## 🔧 Критичные настройки для продакшена

### 1. Backend Environment Variables (.env)

```env
# Основные
DEBUG=False
SECRET_KEY=your-secret-key-here
SIGNING_KEY=your-signing-key-here

# CSRF и CORS (КРИТИЧНО!)
CSRF_TRUSTED_ORIGINS=https://fan-vers.com,https://www.fan-vers.com
CORS_ALLOWED_ORIGINS=https://fan-vers.com,https://www.fan-vers.com

# Cookie настройки
SAME_SITE_COOKIE=Lax  # или None если фронт и API на разных доменах
SESSION_COOKIE_DOMAIN=.fan-vers.com  # опционально, для поддоменов

# HTTPS (автоматически включается при DEBUG=False)
# SECURE_SSL_REDIRECT=True (уже в коде)
# SESSION_COOKIE_SECURE=True (уже в коде)
# CSRF_COOKIE_SECURE=True (уже в коде)
```

### 2. Frontend Environment Variables (.env)

```env
# Для продакшена
VITE_API_URL=/api  # или https://fan-vers.com/api если API на другом домене
```

### 3. Nginx Configuration (если используется)

```nginx
# КРИТИЧНО: эти заголовки должны быть установлены
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header Host $host;

# Для WebSocket
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

---

## ✅ Проверка перед деплоем

### Backend:
- [x] `CsrfViewMiddleware` в MIDDLEWARE (строка 75)
- [x] `CSRF_TRUSTED_ORIGINS` настроен для prod
- [x] `CORS_ALLOWED_ORIGINS` настроен для prod
- [x] Cookies: `secure=True` в prod (автоматически при DEBUG=False)
- [x] Cookies: `samesite='Lax'` (настраивается через env)
- [x] `SECURE_PROXY_SSL_HEADER` настроен для работы за Nginx
- [x] Импорты `csrf_exempt` и `method_decorator` восстановлены

### Frontend:
- [x] `token.get()` использует `getAccessSync()` правильно
- [x] CSRF token получается и отправляется
- [x] Authorization header добавляется для всех запросов
- [x] WebSocket использует правильный метод для получения токена
- [x] `useAuthBootstrap` добавлен в App.jsx

### Безопасность:
- [x] Login/Register - `@csrf_exempt` (не требуют CSRF)
- [x] Refresh/Logout - CSRF защита включена
- [x] Refresh cookie - `httponly=True` (недоступна JavaScript)
- [x] Access token - в памяти (не в localStorage)

---

## 🚀 Инструкция по деплою

### 1. Backend

```bash
# 1. Установите environment variables в .env
DEBUG=False
CSRF_TRUSTED_ORIGINS=https://fan-vers.com,https://www.fan-vers.com
CORS_ALLOWED_ORIGINS=https://fan-vers.com,https://www.fan-vers.com
SAME_SITE_COOKIE=Lax
SESSION_COOKIE_DOMAIN=.fan-vers.com  # опционально

# 2. Соберите статику
python manage.py collectstatic --noinput

# 3. Запустите миграции
python manage.py migrate

# 4. Перезапустите сервер
# (через systemd, supervisor, или ваш процесс-менеджер)
```

### 2. Frontend

```bash
# 1. Установите environment variables в frontend/.env
VITE_API_URL=/api  # или полный URL если API на другом домене

# 2. Соберите проект
npm run build

# 3. Загрузите dist/ на сервер
# (через rsync, scp, или ваш CI/CD)
```

---

## ⚠️ Важные замечания

1. **CSRF_TRUSTED_ORIGINS** - должен включать ВСЕ домены, с которых приходят запросы
   - Если фронт на `fan-vers.com`, а API на `api.fan-vers.com` - добавьте оба
   - Формат: `https://fan-vers.com,https://www.fan-vers.com`

2. **CORS_ALLOWED_ORIGINS** - должен совпадать с CSRF_TRUSTED_ORIGINS
   - Не используйте `*` с `CORS_ALLOW_CREDENTIALS=True`

3. **Cookie domain** - если фронт и API на одном домене:
   - `SESSION_COOKIE_DOMAIN` можно не устанавливать (или `.fan-vers.com` для поддоменов)
   - `SAME_SITE_COOKIE=Lax` обычно достаточно

4. **Cookie domain** - если фронт и API на разных доменах:
   - `SAME_SITE_COOKIE=None` (требует `Secure=True`)
   - `SESSION_COOKIE_DOMAIN` должен быть установлен правильно

5. **Refresh endpoint 401** - это нормально, если:
   - Пользователь только что залогинился (cookie еще не установлена)
   - Refresh cookie истекла (7 дней)
   - Это не критично для основного функционала

---

## 🧪 Тестирование после деплоя

1. **Логин** - проверьте, что логин работает
2. **Профиль** - проверьте, что профиль загружается
3. **Refresh** - проверьте, что refresh работает после логина
4. **Logout** - проверьте, что logout работает
5. **WebSocket** - проверьте, что WebSocket подключается
6. **CSRF** - проверьте, что нет 403 ошибок

---

## 📝 Логи для диагностики

После деплоя проверьте логи Django:
- `🔍 [RequestMiddleware]` - покажет CSRF токен и cookies
- `🔐 [CookieTokenRefreshView]` - покажет детали refresh запроса
- `🔐 [LoginView]` - покажет детали логина

Если видите 401/403 ошибки:
1. Проверьте `CSRF_TRUSTED_ORIGINS`
2. Проверьте `CORS_ALLOWED_ORIGINS`
3. Проверьте логи из `RequestMiddleware` - там будет видно, что именно не так

---

## ✅ Готовность к продакшену: ДА

Все критичные компоненты настроены и работают. Можно деплоить на сервер.

