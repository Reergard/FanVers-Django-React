from pathlib import Path
import os
from datetime import timedelta
import environ



env = environ.Env(
    DEBUG=(bool, False)
)

BASE_DIR = Path(__file__).resolve().parent.parent


environ.Env.read_env(BASE_DIR / ".env")  # Читаємо .env файл


SECRET_KEY = env("SECRET_KEY")

DEBUG = env("DEBUG")

ALLOWED_HOSTS = ['127.0.0.1', 'localhost', '10.0.2.2']


LUSSIED_HOSTS = ['*']




INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Custom apps
    'apps.api',
    'apps.main',
    'apps.catalog',
    'apps.users',
    'apps.search',
    'apps.reviews',
    'apps.navigation',
    'apps.chat',
    'apps.editors',
    'apps.website_advertising',
    'apps.notification.apps.NotificationConfig',
    'apps.monitoring.apps.MonitoringConfig',

    
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_simplejwt',
    'corsheaders',
    'djoser',
    'apps.rating.apps.RatingConfig',
    'channels',
    'django_celery_beat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.users.middleware.RequestMiddleware',  # Добавляем наш middleware
    # 'django.middleware.cache.FetchFromCacheMiddleware', # запобігає кешуванню
    # 'django.middleware.cache.UpdateCacheMiddleware',    # запобігає кешуванню
    # 'apps.main.middleware.no_cache_middleware',  # запобігає кешуванню  (файл middleware.py)
]



CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://10.0.2.2:5173",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "x-request-id",  # Добавляем заголовок ля отслеживания запросов
    "cache-control"  # Добавляем для no-cache
]

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_PREFLIGHT_MAX_AGE = 86400  # 24 часа
CORS_EXPOSE_HEADERS = ["Content-Type", "X-CSRFToken"]


ROOT_URLCONF = 'FanVers_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / os.path.join('templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'FanVers_project.wsgi.application'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny', 
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'profile': '100/day',    # Для ProfileThrottle
        'balance': '10/hour'     # Для BalanceOperationThrottle
    }
}

DJOSER = {
    'LOGIN_FIELD': 'username', # для входу  використовувати логін
    'USER_CREATE_PASSWORD_RETYPE': True,
    'USERNAME_CHANGED_EMAIL_CONFIRMATION': True,
    'PASSWORD_CHANGED_EMAIL_CONFIRMATION': True,
    'SEND_CONFIRMATION_EMAIL': True,
    'PASSWORD_RESET_CONFIRM_URL': "password/reset/confirm/{uid}/{token}",
    'SET_PASSWORD_RETYPE': True,
    'PASSWORD_RESET_CONFIRM_RETYPE': True,
    'USERNAME_RESET_CONFIRM_URL': 'username/reset/confirm/{uid}/{token}',
    'ACTIVATION_URL': 'activate/{uid}/{token}',
    'SEND_ACTIVATION_EMAIL': True,
    'SERIALIZERS': {
        'user_create': 'apps.users.api.serializers.CreateUserSerializer',
        'user': 'apps.users.api.serializers.CreateUserSerializer',
        'user_delete': 'djoser.serializers.UserDeleteSerializer',

    }
}


IS_PRODUCTION_ENV = env.bool("IS_PRODUCTION_ENV")

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = env("EMAIL_HOST")
EMAIL_USE_TLS = True
EMAIL_PORT = env("EMAIL_PORT")
EMAIL_HOST_USER = env("EMAIL_HOST_USER")
EMAIL_HOST_PASSWORD = env("EMAIL_HOST_PASSWORD")
DEFAUND_FROM_EMAIL = "info@journal-bullet.com"
DOMAIN = env("DOMAIN")
SITE_NAME = "FanVers"


SIMPLE_JWT = {
    "AUTH_HEADER_TYPES": (
        "Bearer",
        "JWT"),
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=120),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=60),
    "SIGNING_KEY": env("SIGNING_KEY"),
    "AUTH-HEADER_NAME": "HTTP_AUTHORIZATION",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}







# Сначала определяем настройки Redis (перемещаем в начало настроек Celery)
REDIS_HOST = os.getenv('REDIS_HOST', '127.0.0.1')
REDIS_PORT = os.getenv('REDIS_PORT', '6379')
REDIS_DB = os.getenv('REDIS_DB', '0')

# Затем настройки Celery
CELERY_BROKER_URL = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
CELERY_RESULT_BACKEND = f'redis://{REDIS_HOST}:{REDIS_PORT}/{REDIS_DB}'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers.DatabaseScheduler'




# Настройки Redis
# Эти строки можно удалить, так как они уже определены выше
# REDIS_HOST = os.getenv('REDIS_HOST', '127.0.0.1')
# REDIS_PORT = os.getenv('REDIS_PORT', '6379')
# REDIS_DB = os.getenv('REDIS_DB', '0')







USE_POSTGRES = env("USE_POSTGRES")

if USE_POSTGRES:
    DATABASES = {
        'default': {
            # 'ENGINE': 'django.contrib.gis.db.backends.postgis',
            'ENGINE': 'django.db.backends.postgresql_psycopg2',
            'NAME': env.str('DB_NAME'),
            'USER': env.str('DB_USER'),
            'PASSWORD': env.str('DB_PASS'),
            'HOST': env.str('DB_HOST'),
            'PORT': env.int('DB_PORT'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }



AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]




ASGI_APPLICATION = 'FanVers_project.asgi.application'

CHANNEL_LAYERS = {
    "default": {
        "BACKEND": "channels.layers.InMemoryChannelLayer"
    }
}



LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, "static")

MEDIA_URL = 'media/'
MEDIA_ROOT = os.path.join(BASE_DIR, "media")


FILE_UPLOAD_PERMISSIONS = 0o644
FILE_UPLOAD_DIRECTORY_PERMISSIONS = 0o755


ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif']



DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'

# Настройки логирования для Celery
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose'
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'debug.log',
            'formatter': 'verbose'
        },
        'celery_file': {
            'class': 'logging.FileHandler',
            'filename': 'celery.log',
            'formatter': 'verbose'
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': True,
        },
        'apps.users': {
            'handlers': ['console', 'file'],
            'level': 'ERROR',
            'propagate': True,
        },
        'celery': {
            'handlers': ['console', 'celery_file'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Максимальная сумма операции с балансом
MAX_BALANCE_OPERATION_AMOUNT = 1000000

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
