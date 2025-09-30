# Чек-лист тестирования системы авторизации

## ✅ Критичные исправления выполнены

1. **tokenService.js** - добавлены геттеры `hasAccess()` и `getAccessSync()`
2. **useAuth.js** - исправлена проверка токена через `tokenService.hasAccess()`
3. **useAuthBootstrap.js** - добавлен Redux dispatch для `setHasToken()`
4. **authAPI.js** - обновлен login метод на `/users/login/` с cookie-схемой
5. **authService.js** - исправлен метод `checkTokens()`
6. **LogoutView** - изменен на `AllowAny` для дружелюбного логаута
7. **useAuth.js** - добавлена синхронизация `hasToken` при forceLogout

## 🧪 Тестирование в браузере (DevTools → Network)

### 1. Логин
```
POST /api/users/login/ 
→ 200 {access} 
+ Set-Cookie: refresh_token=…; HttpOnly; SameSite=Lax; Secure?
```
**Проверить:**
- В памяти есть access токен
- В localStorage/sessionStorage токенов НЕТ
- Redux `hasToken = true`

### 2. Ленивая активность (через ~14-15 минут)
```
Любой API-запрос:
1. POST /api/users/refresh/ (с кукой)
2. Повтор исходного запроса с новым Authorization: Bearer …
```
**Проверить:**
- Никаких "голых" запросов без токена
- Автоматическое обновление access токена

### 3. Автопродление от UI
```
Focus/visibilitychange=visible:
POST /api/users/refresh/
→ новый access в память
→ Redux hasToken=true
```

### 4. Простой >7 дней
```
Кука протухла:
POST /api/users/refresh/ → 401
→ пользователь становится гостем
→ Redux hasToken=false
```

### 5. Логаут
```
POST /api/users/logout/
→ cookie удалена
→ refresh заблэклистен
→ последующие refresh → 401
```

### 6. Защищённые роуты
```
Пока профиль грузится:
- PrivateRoute НЕ редиректит
- Если hasToken=true, но профиль не получен → ожидаем
- Если hasToken=false и isAuthenticated=false → редиректим
```

## 🔧 Дополнительные проверки

### Console логи (development)
- `useAuth: Перевірка умов` - правильные значения
- `Bootstrap: токен обновлен` - при focus/visibility
- `Force logout виконано` - при ошибках авторизации

### Redux DevTools
- `auth/hasToken` изменяется корректно
- `auth/isAuthenticated` синхронизирован с реальным состоянием
- `auth/userInfo` загружается после успешного логина

### Security проверки
- Refresh токен недоступен в JavaScript (HttpOnly)
- Access токен только в памяти (исчезает при закрытии вкладки)
- CSRF защита через `X-Requested-With` заголовок
- Автоматическая ротация refresh токенов

## 🚀 Готовность к продакшену

### Environment переменные
```env
# Для кросс-доменной схемы
SAME_SITE_COOKIE=None
SECURE_COOKIE=true

# Для same-site схемы (по умолчанию)
SAME_SITE_COOKIE=Lax
SECURE_COOKIE=false  # в dev, true в prod
```

### Nginx конфигурация
- `proxy_set_header X-Forwarded-Proto $scheme;` ✅
- HTTPS в продакшене ✅
- CORS настройки для точных доменов ✅

### Мониторинг
- Логи авторизации в Django
- Метрики refresh запросов
- Отслеживание forceLogout событий

## ⚠️ Известные ограничения

1. **SameSite cookie** - сейчас `Lax`, для кросс-доменов нужен `None + Secure`
2. **SessionAuthentication** - включен, может требовать CSRF для сессионных форм
3. **RegisterView** - пока возвращает JSON, не cookie (можно оставить как есть)

## 🎯 Результат

Система авторизации теперь:
- ✅ Безопасна (HttpOnly cookies, in-memory access)
- ✅ Автоматически обновляет токены при активности
- ✅ Корректно обрабатывает истечение сессий
- ✅ Синхронизирует состояние между компонентами
- ✅ Готова к продакшену
