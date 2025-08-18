# FanVers - Платформа для чтения и перевода книг

FanVers - это полнофункциональная веб-платформа для чтения, перевода и публикации книг. Проект построен на современном стеке технологий с использованием Django REST API и React фронтенда.

## 🚀 Основные возможности

- **Чтение книг**: Удобный интерфейс для чтения глав с поддержкой закладок
- **Система переводов**: Платформа для переводчиков с системой комиссий
- **Платежная система**: Встроенная система баланса и покупок глав
- **Чат между пользователями**: Real-time общение через WebSocket
- **Система рейтингов и отзывов**: Оценка книг и глав
- **Поиск и фильтрация**: Продвинутый поиск по каталогу
- **Уведомления**: Система уведомлений о новых главах и событиях
- **Аналитика**: Статистика чтения и популярности книг

## 🛠 Технологический стек

### Backend (Django)
- **Django 5.1.3** - основной веб-фреймворк
- **Django REST Framework** - API
- **Django Channels** - WebSocket поддержка
- **Celery** - асинхронные задачи
- **Redis** - кеширование и брокер сообщений
- **PostgreSQL/SQLite** - база данных
- **Djoser** - аутентификация
- **Django CORS Headers** - CORS поддержка

### Frontend (React)
- **React 18.3.1** - UI библиотека
- **Redux Toolkit** - управление состоянием
- **React Router** - маршрутизация
- **Axios** - HTTP клиент
- **React Bootstrap** - UI компоненты
- **Tailwind CSS** - стилизация
- **React Query** - управление серверным состоянием

## 📁 Структура проекта

```
FanVers-Django-React/
├── backend/                 # Django API
│   ├── apps/               # Django приложения
│   │   ├── users/          # Пользователи и профили
│   │   ├── catalog/        # Каталог книг и глав
│   │   ├── chat/           # Чат система
│   │   ├── reviews/        # Отзывы и комментарии
│   │   ├── rating/         # Система рейтингов
│   │   ├── search/         # Поиск и фильтрация
│   │   ├── notification/   # Уведомления
│   │   ├── monitoring/     # Аналитика и мониторинг
│   │   ├── navigation/     # Навигация и закладки
│   │   ├── editors/        # Редакторы и модерация
│   │   └── website_advertising/ # Реклама
│   ├── FanVers_project/    # Основные настройки Django
│   ├── requirements.txt    # Python зависимости
│   └── manage.py          # Django CLI
├── frontend/               # React приложение
│   ├── src/
│   │   ├── api/           # API клиенты
│   │   ├── auth/          # Аутентификация
│   │   ├── catalog/       # Каталог книг
│   │   ├── chat/          # Чат компоненты
│   │   ├── users/         # Профили пользователей
│   │   ├── components/    # Общие компоненты
│   │   └── store.js       # Redux store
│   ├── package.json       # Node.js зависимости
│   └── public/            # Статические файлы
└── tree_clean.py          # Утилита для отображения структуры
```

## 🚀 Быстрый старт

### Предварительные требования

- Python 3.8+
- Node.js 16+
- Redis
- Git

### Установка и запуск

1. **Клонирование репозитория**
   ```bash
   git clone https://github.com/Reergard/FanVers-Django-React.git
   cd FanVers-Django-React
   ```

2. **Настройка Backend (Django)**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # Linux/Mac
   
   pip install -r requirements.txt
   
   # Создание .env файла (скопируйте из .env.example)
   cp .env.example .env
   
   # Настройка базы данных
   python manage.py migrate
   python manage.py createsuperuser
   
   # Запуск сервера разработки
   python manage.py runserver
   ```

3. **Настройка Frontend (React)**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Запуск дополнительных сервисов**
   ```bash
   # Redis (для Celery и WebSocket)
   redis-server
   
   # Celery worker (в отдельном терминале)
   cd backend
   celery -A FanVers_project worker -l info
   
   # Celery beat (для периодических задач)
   celery -A FanVers_project beat -l info
   ```

## 🔧 Конфигурация

### Переменные окружения (.env)

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
IS_PRODUCTION_ENV=False

# База данных
USE_POSTGRES=False  # True для PostgreSQL

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_DB=0

# JWT
SIGNING_KEY=your-jwt-signing-key
```

## 📚 API Документация

После запуска Django сервера, API документация доступна по адресу:
- **Swagger UI**: `http://localhost:8000/api/swagger/`
- **ReDoc**: `http://localhost:8000/api/redoc/`

## 🧪 Тестирование

### Backend тесты
```bash
cd backend
python manage.py test
```

### Frontend тесты
```bash
cd frontend
npm test
```

## 📦 Развертывание

### Production сборка Frontend
```bash
cd frontend
npm run build
```

### Production настройки Django
```bash
cd backend
python manage.py collectstatic
python manage.py migrate
```

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📄 Лицензия

Этот проект лицензирован под MIT License - см. файл [LICENSE](LICENSE) для деталей.

## 👥 Команда

- **Разработчик**: [Reergard](https://github.com/Reergard)

## 📞 Поддержка

Если у вас есть вопросы или проблемы:
- Создайте Issue в GitHub
- Обратитесь к документации в папке `docs/`

---

**FanVers** - Погрузитесь в мир литературы! 📚✨ 