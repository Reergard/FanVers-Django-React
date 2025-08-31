# Руководство по диагностике проблем с созданием книг

## 🚨 **Основные проблемы и решения:**

### 1. **Backend недоступен (ERR_CONNECTION_REFUSED)**

**Симптомы:**
- Все API запросы возвращают `ERR_CONNECTION_REFUSED`
- В консоли браузера: `Failed to load resource: net::ERR_CONNECTION_REFUSED`

**Решение:**
```bash
cd backend
python manage.py runserver
```

**Проверка:**
```bash
curl http://localhost:8000/api/catalog/genres/
# Должен вернуть список жанров или 401 (если не авторизован)
```

### 2. **Проблемы с авторизацией**

**Симптомы:**
- HTTP 401 Unauthorized
- Сообщение "Необхідна авторизація"

**Решение:**
1. Проверить токен в localStorage
2. Перелогиниться
3. Проверить срок действия JWT токена

### 3. **Проблемы с валидацией формы**

**Симптомы:**
- HTTP 400 Bad Request
- Сообщения об ошибках валидации

**Диагностика:**
1. Проверить консоль браузера на ошибки валидации
2. Проверить backend логи на детали ошибок
3. Убедиться, что все обязательные поля заполнены

### 4. **Проблемы с правами доступа**

**Симптомы:**
- HTTP 403 Forbidden
- Сообщение "У вас немає прав для створення книг"

**Решение:**
1. Проверить роль пользователя в профиле
2. Убедиться, что роль "Перекладач" или "Літератор"
3. Проверить настройки permissions в backend

## 🔍 **Пошаговая диагностика:**

### **Шаг 1: Проверить backend**
```bash
# В терминале backend
python manage.py runserver

# Ожидаемый вывод:
# Watching for file changes with StatReloader
# Performing system checks...
# System check identified no issues (0 silenced).
# Starting development server at http://127.0.0.1:8000/
```

### **Шаг 2: Проверить API endpoints**
```bash
# Без авторизации
curl http://localhost:8000/api/catalog/genres/
# Должен вернуть 401

# С авторизацией
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/catalog/genres/
# Должен вернуть список жанров
```

### **Шаг 3: Проверить создание книги**
```bash
curl -X POST http://localhost:8000/api/catalog/books/create/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "title=Test Book" \
  -F "author=Test Author" \
  -F "country=1" \
  -F "genres[]=1" \
  -F "book_type=TRANSLATION" \
  -F "translation_status=TRANSLATING" \
  -F "original_status=ONGOING"
```

## 📝 **Логи для диагностики:**

### **Frontend логи:**
- `BookCreate Debug:` - состояние формы и пользователя
- `catalogAPI.createBook:` - процесс создания книги
- `BookCreate: Попытка отправки формы` - начало отправки

### **Backend логи:**
- `create_book: Получен запрос от пользователя` - получение запроса
- `BookCreateSerializer.validate:` - валидация данных
- `create_book: Книга успешно создана` - успешное создание

## 🛠️ **Частые проблемы:**

### **1. Неправильный Content-Type**
- Должен быть `multipart/form-data` для форм с файлами
- Проверить заголовки в Network tab браузера

### **2. Неправильная структура данных**
- Массивы должны отправляться как `field[]`
- Проверить FormData в консоли

### **3. Проблемы с файлами**
- Проверить размер и тип изображения
- Убедиться, что файл не поврежден

## ✅ **Чек-лист для проверки:**

- [ ] Backend запущен на порту 8000
- [ ] JWT токен валиден и не истек
- [ ] Пользователь имеет роль "Перекладач" или "Літератор"
- [ ] Все обязательные поля заполнены
- [ ] Форма валидна (нет ошибок в консоли)
- [ ] API endpoint доступен
- [ ] Нет ошибок CORS
- [ ] Файлы загружаются корректно

## 🆘 **Если ничего не помогает:**

1. **Очистить кэш браузера**
2. **Перезапустить backend**
3. **Проверить firewall/антивирус**
4. **Проверить настройки Django (DEBUG=True)**
5. **Проверить логи Django на ошибки**
