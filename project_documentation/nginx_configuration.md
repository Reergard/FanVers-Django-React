# Nginx Configuration Guide

## Overview

This document provides comprehensive Nginx configuration recommendations for the FanVers project, including security, performance, and monitoring settings.

## Basic Configuration

### 1. Request Size Limits
```nginx
http {
    client_max_body_size 5m;  # Limit to 5MB for avatar uploads
    
    server {
        # ... other settings ...
        
        location /api/ {
            proxy_pass http://127.0.0.1:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### 2. Media Files Handling
```nginx
# Serve media files as static (no execution)
location /media/ {
    alias /path/to/your/media/;
    expires 1y;
    add_header Cache-Control "public, immutable";
    
    # Prohibit file execution
    location ~* \.(php|py|pl|sh|cgi)$ {
        deny all;
    }
    
    # Correct Content-Type for images
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
```

## Security Configuration

### 1. DDoS Protection
```nginx
http {
    # Rate limiting for file uploads
    limit_req_zone $binary_remote_addr zone=upload:10m rate=5r/h;
    
    server {
        location /api/users/profile/upload-image/ {
            limit_req zone=upload burst=2 nodelay;
            proxy_pass http://127.0.0.1:8000;
        }
    }
}
```

### 2. Security Headers
```nginx
http {
    # HSTS and other security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    server {
        # ... other settings ...
    }
}
```

### 3. SSL/TLS Configuration
```nginx
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;
ssl_session_cache shared:SSL:10m;
ssl_session_timeout 10m;
```

## Performance Optimization

### 1. Caching
```nginx
# Static files caching
location /static/ {
    alias /path/to/static/files/;
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Media files caching
location /media/ {
    alias /path/to/media/files/;
    expires 1M;
    add_header Cache-Control "public";
}
```

### 2. Compression
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types
    text/plain
    text/css
    text/xml
    text/javascript
    application/javascript
    application/xml+rss
    application/json;
```

### 3. Connection Settings
```nginx
# Connection limits
worker_processes auto;
worker_connections 1024;
keepalive_timeout 65;
keepalive_requests 100;
```

## Monitoring and Logging

### 1. Access Logging
```nginx
# Custom log format
log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                '$status $body_bytes_sent "$http_referer" '
                '"$http_user_agent" "$http_x_forwarded_for"';

access_log /var/log/nginx/access.log main;
error_log /var/log/nginx/error.log;
```

### 2. Status Monitoring
```nginx
location /nginx_status {
    stub_status on;
    access_log off;
    allow 127.0.0.1;
    deny all;
}
```

### 3. Health Checks
```nginx
location /health {
    access_log off;
    return 200 "healthy\n";
    add_header Content-Type text/plain;
}
```

## WSGI Configuration

### 1. Gunicorn Configuration
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

### 2. Uvicorn Configuration (for ASGI)
```python
# uvicorn.conf.py
host = "127.0.0.1"
port = 8000
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
limit_max_requests = 1000
limit_max_requests_jitter = 100
```

## Complete Production Configuration

```nginx
http {
    # Basic settings
    client_max_body_size 5m;
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;
    limit_req_zone $binary_remote_addr zone=upload:10m rate=5r/h;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect HTTP to HTTPS
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com;
        
        # SSL configuration
        ssl_certificate /path/to/certificate.crt;
        ssl_certificate_key /path/to/private.key;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # API endpoints with throttling
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header Host $host;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            proxy_pass http://127.0.0.1:8000;
            proxy_redirect off;
            
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 120s;
        }
        
        # Static files
        location /static/ {
            alias /path/to/static/files/;
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
        
        # Media files
        location /media/ {
            alias /path/to/media/files/;
            expires 1M;
            add_header Cache-Control "public";
            
            # Prohibit file execution
            location ~* \.(php|py|pl|sh|cgi)$ {
                deny all;
            }
        }
        
        # Health check
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
        
        # Nginx status
        location /nginx_status {
            stub_status on;
            access_log off;
            allow 127.0.0.1;
            deny all;
        }
    }
}
```

## Important Notes

### 1. client_max_body_size
- **Required**: `client_max_body_size 5m;` in Nginx
- **Reason**: Prevents large uploads from reaching Django
- **Security**: Protection against DDoS through large files

### 2. HSTS
- **Warning**: HSTS only works with HTTPS
- **Production**: `SECURE_SSL_REDIRECT = True` in Django
- **Security**: Forces HTTPS connections

### 3. File Security
- **Django**: Uses storage from model field
- **Nginx**: Serves media as static files
- **Protection**: Prohibits execution of scripts (.php, .py, .sh)

### 4. Proxy Headers
- **Critical**: `X-Forwarded-Proto` for HTTPS redirects
- **Required**: `X-Forwarded-For` for client identification
- **Important**: `NUM_PROXIES = 1` in Django settings

## Troubleshooting

### Common Issues

1. **502 Bad Gateway**
   - Check if Django server is running
   - Verify proxy_pass URL
   - Check firewall settings

2. **413 Request Entity Too Large**
   - Increase `client_max_body_size`
   - Check Django `FILE_UPLOAD_MAX_MEMORY_SIZE`

3. **429 Too Many Requests**
   - Adjust rate limiting zones
   - Check burst settings
   - Monitor access logs

### Monitoring Commands

```bash
# Check Nginx status
nginx -t
systemctl status nginx

# Monitor access logs
tail -f /var/log/nginx/access.log

# Check rate limiting
grep "429" /var/log/nginx/access.log

# Monitor error logs
tail -f /var/log/nginx/error.log
```
