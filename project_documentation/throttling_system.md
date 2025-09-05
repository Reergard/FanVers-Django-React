# Система тротлинга и защиты от злоупотреблений

## Обзор

Система тротлинга FanVers обеспечивает защиту от DDoS атак, злоупотреблений API и обеспечивает справедливое распределение ресурсов между пользователями.

## Архитектура

### Многоуровневая защита
1. **Nginx Edge Protection** - первая линия защиты
2. **DRF Throttling** - ограничения на уровне API
3. **Smart Throttling** - интеллектуальное определение подозрительных запросов
4. **Custom Exception Handler** - детальная обработка ошибок

## Компоненты системы

### 1. Nginx Edge Protection (`nginx_throttling.conf`)

**Rate Limiting Zones:**
```nginx
# Основная зона для API
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

# Дополнительные зоны
limit_req_zone $binary_remote_addr zone=heavy:10m rate=2r/s;
limit_req_zone $binary_remote_addr zone=light:10m rate=10r/s;
```

**Применение ограничений:**
```nginx
location /api/ {
    limit_req zone=api burst=20 nodelay;
    
    # Пробрасывание заголовков для правильной идентификации
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    
    # Увеличенные таймауты
    proxy_read_timeout 120s;
}
```

**Преимущества:**
- Защита на уровне edge сервера
- Минимальная нагрузка на Django
- Быстрое отсеивание атак

### 2. DRF Throttling (`settings.py`)

**Базовые ограничения:**
```python
'DEFAULT_THROTTLE_RATES': {
    'user': '240/min',      # Авторизованные пользователи
    'anon': '120/min',      # Анонимные пользователи
}
```

**Специализированные ограничения:**
```python
# Бизнес-логика
'read_heavy': '240/min',   # Детали книг, ленты
'read_light': '120/min',   # Листинг, поиск
'rating': '30/min',        # Голосование, лайки
'analytics': '60/min',     # Телеметрия, trackView
'upload': '20/hour',       # Загрузка файлов
'purchase': '10/hour',     # Покупки глав
'balance': '100/hour',     # Операции с балансом
'profile': '1000/hour',    # Профили пользователей
```

**Применение в ViewSets:**
```python
class BookRatingViewSet(viewsets.ModelViewSet):
    throttle_scope = 'rating'  # 30 запросов/минуту
    
    def get_throttle_scope(self):
        if self.action in ['list', 'retrieve']:
            return 'read_light'  # 120 запросов/минуту
        return 'rating'
```

### 3. Smart Throttling (`smart_throttling.py`)

**Принцип работы:**
- Атомарный счетчик через Redis
- Определение подозрительных паттернов
- Динамическое понижение лимитов

**Алгоритм:**
```python
class SmartThrottle:
    THRESHOLD = 120  # запросов за 60 секунд
    TTL = 60         # время жизни счетчика
    
    @staticmethod
    def is_suspicious_request(request):
        # 1. Проверка User-Agent
        user_agent = request.META.get('HTTP_USER_AGENT', '').lower()
        suspicious_agents = ['bot', 'crawler', 'spider', 'scraper']
        
        if any(x in user_agent for x in suspicious_agents):
            return True
        
        # 2. Атомарный счетчик
        ident = BaseThrottle().get_ident(request)
        key = f"st:req:{ident}"
        
        # Атомарная инициализация
        added = cache.add(key, 1, TTL)
        if not added:
            count = cache.incr(key)
        else:
            count = 1
        
        return count >= THRESHOLD
```

**Интеграция с ViewSets:**
```python
def get_throttle_scope(self):
    if SmartThrottle.is_suspicious_request(self.request):
        return 'rating'  # Понижение до 30/мин
    return 'read_light'  # Обычный лимит 120/мин
```

### 4. Exception Handler (`exc_handlers.py`)

**Обработка 429 ошибок:**
```python
def drf_exception_handler(exc, context):
    if isinstance(exc, Throttled):
        response.data = {
            "detail": "Request was throttled.",
            "scope": view.throttle_scope,
            "available_in_sec": exc.wait,
            "error_type": "throttled"
        }
        
        # Заголовки для фронтенда
        response["X-RateLimit-Reset"] = str(exc.wait)
        response["Retry-After"] = str(exc.wait)
    
    return response
```

## Стратегии тротлинга

### 1. По типу пользователя

**Анонимные пользователи:**
- Базовый лимит: 120 запросов/минуту
- Ограниченный доступ к API
- Приоритет для публичного контента

**Авторизованные пользователи:**
- Увеличенный лимит: 240 запросов/минуту
- Полный доступ к API
- Приоритет для личного контента

### 2. По типу операции

**Чтение (read_light):**
- 120 запросов/минуту
- Поиск, листинг, фильтрация
- Кешируемые операции

**Тяжелые операции (read_heavy):**
- 240 запросов/минуту
- Детали книг, ленты новостей
- Требуют обработки данных

**Голосование (rating):**
- 30 запросов/минуту
- Оценки, лайки, дизлайки
- Защита от накрутки

**Аналитика (analytics):**
- 60 запросов/минуту
- trackView, телеметрия
- Не критичные операции

**Загрузки (upload):**
- 20 запросов/час
- Загрузка изображений, файлов
- Ресурсоемкие операции

**Покупки (purchase):**
- 10 запросов/час
- Покупка глав, пополнение баланса
- Финансовые операции

### 3. По подозрительности

**Обычные запросы:**
- Стандартные лимиты
- Нормальный User-Agent
- Регулярные интервалы

**Подозрительные запросы:**
- Понижение до rating (30/мин)
- Bot-like User-Agent
- Высокая частота запросов

## Мониторинг и аналитика

### 1. Метрики тротлинга

**Счетчики:**
- Количество заблокированных запросов
- Распределение по типам операций
- Частота срабатывания Smart Throttling

**Временные метрики:**
- Время блокировки по типам
- Частота обновления лимитов
- Эффективность защиты

### 2. Логирование

**Уровни логирования:**
- INFO: Нормальная работа
- WARNING: Срабатывание тротлинга
- ERROR: Критические ошибки

**Структура логов:**
```python
logger.warning(f"Request throttled: scope={scope}, wait={wait}s, view={view_name}")
```

### 3. Алерты

**Критические события:**
- Массовые блокировки (>100/мин)
- Атаки на конкретные endpoints
- Недоступность Redis

**Предупреждения:**
- Высокая частота 429 ошибок
- Подозрительная активность
- Необычные паттерны запросов

## Оптимизация производительности

### 1. Redis Configuration

**Настройки кеша:**
```python
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB_CACHE}',
        'KEY_PREFIX': 'fanvers_cache',
        'TIMEOUT': 300,
    }
}
```

**Разделение DB:**
- DB 1: Django Cache (throttling)
- DB 2: Celery (tasks)
- DB 3: Channels (websockets)

### 2. Атомарные операции

**Безопасные счетчики:**
```python
# Атомарная инициализация
added = cache.add(key, 1, TTL)
if not added:
    count = cache.incr(key)
```

**Преимущества:**
- Отсутствие race conditions
- Консистентность данных
- Высокая производительность

### 3. Кеширование

**Стратегии кеширования:**
- Популярные запросы: 5 минут
- Статистика: 1 час
- Конфигурация: 24 часа

## Рекомендации по настройке

### 1. Для разработки

**Либеральные лимиты:**
```python
'DEFAULT_THROTTLE_RATES': {
    'user': '1000/min',
    'anon': '500/min',
    # ... остальные лимиты увеличены в 2-3 раза
}
```

**Отключение Smart Throttling:**
```python
# В development режиме
if DEBUG:
    SmartThrottle.THRESHOLD = 10000
```

### 2. Для продакшена

**Строгие лимиты:**
- Снижение лимитов в 2-3 раза
- Включение всех защит
- Мониторинг и алерты

**Nginx конфигурация:**
```nginx
# Более строгие лимиты
limit_req_zone $binary_remote_addr zone=api:10m rate=2r/s;
limit_req zone=api burst=10 nodelay;
```

### 3. Для высоконагруженных систем

**Горизонтальное масштабирование:**
- Несколько Nginx серверов
- Shared Redis cluster
- Load balancer с sticky sessions

**Вертикальное масштабирование:**
- Увеличение лимитов Redis
- Оптимизация запросов
- Кеширование на уровне приложения

## Диагностика проблем

### 1. Частые проблемы

**429 Too Many Requests:**
- Проверить лимиты в settings.py
- Убедиться в корректности throttle_scope
- Проверить работу Redis

**Медленная работа:**
- Проверить настройки Nginx
- Убедиться в доступности Redis
- Оптимизировать запросы к БД

### 2. Инструменты диагностики

**Redis мониторинг:**
```bash
redis-cli monitor
redis-cli info stats
```

**Nginx логи:**
```bash
tail -f /var/log/nginx/access.log | grep 429
```

**Django логи:**
```python
# В settings.py
LOGGING = {
    'loggers': {
        'rest_framework.throttling': {
            'level': 'DEBUG',
        }
    }
}
```

## Заключение

Система тротлинга FanVers обеспечивает надежную защиту от злоупотреблений при сохранении высокой производительности. Многоуровневая архитектура позволяет гибко настраивать ограничения в зависимости от нагрузки и требований безопасности.
