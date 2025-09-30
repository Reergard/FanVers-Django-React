# Конфигурация для продакшена

## Environment переменные

### Backend (.env)
```env
# Основные настройки
DEBUG=False
SECRET_KEY=your-secret-key
SIGNING_KEY=your-signing-key

# База данных
USE_POSTGRES=True
DB_NAME=fanvers_prod
DB_USER=fanvers_user
DB_PASS=secure_password
DB_HOST=localhost
DB_PORT=5432

# CORS и CSRF
CORS_ALLOWED_ORIGINS=["https://fan-vers.com", "https://www.fan-vers.com"]
CSRF_TRUSTED_ORIGINS=["https://fan-vers.com", "https://www.fan-vers.com"]

# Cookie настройки
SESSION_COOKIE_DOMAIN=.fan-vers.com  # для поддоменов
SAME_SITE_COOKIE=None  # для кросс-доменов
SECURE_COOKIE=True

# HTTPS настройки
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_DB_CACHE=1
REDIS_DB_CELERY=2
REDIS_DB_CHANNELS=3

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=info@fan-vers.com
DOMAIN=fan-vers.com
```

### Frontend (.env)
```env
VITE_API_URL=https://api.fan-vers.com/api
```

## Nginx конфигурация

```nginx
server {
    listen 443 ssl http2;
    server_name api.fan-vers.com;
    
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    
    # Проксирование заголовков
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host $host;
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Статические файлы
    location /static/ {
        alias /path/to/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Медиа файлы
    location /media/ {
        alias /path/to/media/;
        expires 1M;
        add_header Cache-Control "public";
    }
}
```

## Обновление cookie настроек для продакшена

### Backend - динамические cookie настройки
```python
# В settings.py добавить
import os

def get_cookie_params():
    """Динамические параметры cookie в зависимости от окружения"""
    secure = not DEBUG
    samesite = os.getenv('SAME_SITE_COOKIE', 'Lax')
    domain = os.getenv('SESSION_COOKIE_DOMAIN', None)
    
    return {
        'httponly': True,
        'secure': secure,
        'samesite': samesite,
        'domain': domain,
        'path': '/',
        'max_age': 60 * 60 * 24 * 7,  # 7 дней
    }
```

### Обновить views.py для использования динамических настроек
```python
# В _cookie_params() заменить на:
def _cookie_params():
    """Параметры для refresh cookie"""
    secure = not settings.DEBUG
    samesite = os.getenv('SAME_SITE_COOKIE', 'Lax')
    domain = os.getenv('SESSION_COOKIE_DOMAIN', None)
    
    return dict(
        httponly=True,
        secure=secure,
        samesite=samesite,
        domain=domain,
        path='/',
        max_age=REFRESH_MAX_AGE,
    )
```

## Проверка готовности к продакшену

### 1. Время сервера
```bash
# Проверить синхронизацию времени
timedatectl status
# Убедиться что NTP включен
systemctl status ntp
```

### 2. SSL сертификаты
```bash
# Проверить срок действия
openssl x509 -in certificate.crt -text -noout | grep "Not After"
```

### 3. CORS тестирование
```javascript
// В браузере на фронтенде
fetch('https://api.fan-vers.com/api/users/refresh/', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'X-Requested-With': 'XMLHttpRequest'
  }
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

### 4. Cookie тестирование
```javascript
// Проверить что refresh cookie установлена
console.log(document.cookie); // НЕ должно содержать refresh_token
// (должна быть HttpOnly)

// Проверить что access токен в памяти
console.log(tokenService.hasAccess()); // true/false
```

## Мониторинг

### Логи авторизации
```python
# В settings.py добавить
LOGGING['loggers']['auth'] = {
    'handlers': ['console'],
    'level': 'INFO',
    'propagate': True,
}
```

### Метрики refresh запросов
- Количество успешных refresh в минуту
- Количество 401 ошибок
- Время ответа refresh endpoint

## Безопасность

### 1. CSRF защита
- X-Requested-With заголовок ✅
- CORS настройки для точных доменов ✅
- При необходимости: double-submit CSRF

### 2. Cookie безопасность
- HttpOnly ✅
- Secure в продакшене ✅
- SameSite=None для кросс-доменов ✅
- Автоматическая ротация refresh ✅

### 3. JWT безопасность
- Короткий срок жизни access (15 мин) ✅
- Ротация refresh токенов ✅
- Blacklist истекших токенов ✅
- LEEWAY для синхронизации времени ✅
