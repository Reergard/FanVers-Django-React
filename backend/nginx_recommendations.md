# Рекомендації для Nginx та WSGI налаштувань

## Nginx налаштування

### 1. Обмеження розміру тіла запиту
```nginx
http {
    client_max_body_size 5m;  # Обмеження до 5MB для завантаження аватара
    
    server {
        # ... інші налаштування ...
        
        location /api/ {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # Роздача медіа файлів як статичних (без виконання)
        location /media/ {
            alias /path/to/your/media/;
            expires 1y;
            add_header Cache-Control "public, immutable";
            
            # Заборона виконання файлів
            location ~* \.(php|py|pl|sh|cgi)$ {
                deny all;
            }
            
            # Правильні Content-Type для зображень
            location ~* \.(jpg|jpeg)$ {
                add_header Content-Type "image/jpeg";
            }
            location ~* \.(png)$ {
                add_header Content-Type "image/png";
            }
            location ~* \.(webp)$ {
                add_header Content-Type "image/webp";
            }
        }
    }
}
```

### 2. Захист від DDoS
```nginx
http {
    # Rate limiting для завантаження файлів
    limit_req_zone $binary_remote_addr zone=upload:10m rate=5r/h;
    
    server {
        location /api/users/profile/upload-image/ {
            limit_req zone=upload burst=2 nodelay;
            proxy_pass http://127.0.0.1:8000;
        }
    }
}
```

### 3. Додаткові заголовки безпеки
```nginx
http {
    # HSTS та інші заголовки безпеки
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    server {
        # ... інші налаштування ...
    }
}
```

## WSGI налаштування

### 1. Gunicorn конфігурація
```python
# gunicorn.conf.py
bind = "127.0.0.1:8000"
workers = 4
worker_class = "sync"
worker_connections = 1000
max_requests = 1000
max_requests_jitter = 100
timeout = 30
keepalive = 2
```

### 2. Uvicorn конфігурація (для ASGI)
```python
# uvicorn.conf.py
host = "127.0.0.1"
port = 8000
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
limit_max_requests = 1000
limit_max_requests_jitter = 100
```

## Безпека

### 1. Заголовки безпеки
```nginx
add_header X-Content-Type-Options nosniff;
add_header X-Frame-Options DENY;
add_header X-XSS-Protection "1; mode=block";
add_header Referrer-Policy "strict-origin-when-cross-origin";
```

### 2. SSL/TLS налаштування
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

### 3. HSTS та додаткові заголовки
```nginx
# HSTS (HTTP Strict Transport Security)
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Додаткові заголовки безпеки
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

## Моніторинг

### 1. Логування
```nginx
access_log /var/log/nginx/access.log;
error_log /var/log/nginx/error.log;
```

### 2. Метрики
```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

## Важливі зауваження

### 1. client_max_body_size
- **Обов'язково**: `client_max_body_size 5m;` в Nginx
- **Причина**: Обрізає "важкі" завантаження до Django
- **Безпека**: Захист від DDoS через великі файли

### 2. HSTS
- **Увага**: HSTS включається тільки при HTTPS
- **Продакшен**: `SECURE_SSL_REDIRECT = True` в Django
- **Безпека**: Примусове HTTPS з'єднання

### 3. Storage безпека
- **Django**: Використовує storage з поля моделі
- **Nginx**: Роздає медіа як статичні файли
- **Заборона**: Виконання файлів (.php, .py, .sh)
