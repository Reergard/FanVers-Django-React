# Документація інтеграції створення книг

## Огляд архітектури

### Backend (Django)
- **Модель**: `Book` в `backend/apps/catalog/models.py`
- **API Endpoint**: `POST /api/catalog/books/create/`
- **Серіалізатор**: `BookCreateSerializer` в `backend/apps/catalog/api/serializers.py`
- **View**: `create_book` в `backend/apps/catalog/api/views.py`

### Frontend (React)
- **Сторінка**: `BookCreate.js` в `frontend/src/catalog/pages/`
- **API**: `catalogAPI.createBook()` в `frontend/src/api/catalog/catalogAPI.js`
- **Захист доступу**: `TranslatorAccessGuard` компонент

## Структура даних

### Обов'язкові поля
```javascript
{
  title: string,           // Назва мовою оригіналу
  author: string,          // Автор твору
  country: number,         // ID країни
  genres: number[],        // Масив ID жанрів
  original_status: string, // Статус випуску оригіналу
  book_type: string        // Тип твору (AUTHOR/TRANSLATION)
}
```

### Опціональні поля
```javascript
{
  title_en: string,        // Назва мовою перекладу
  description: string,     // Опис/рецензія (макс. 250 слів)
  tags: number[],          // Масив ID тегів
  fandoms: number[],       // Масив ID фандомів
  image: File,             // Зображення книги
  adult_content: boolean,  // Контент 18+
  translation_status: string // Статус перекладу (для TRANSLATION)
}
```

## API інтеграція

### Створення книги
```javascript
const createBook = async (bookData) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Необхідна авторизація');
  }

  const formData = new FormData();
  Object.keys(bookData).forEach(key => {
    if (key === 'image') {
      if (bookData[key]) {
        formData.append(key, bookData[key]);
      }
    } else if (Array.isArray(bookData[key])) {
      bookData[key].forEach(value => {
        formData.append(`${key}[]`, value);
      });
    } else {
      formData.append(key, bookData[key]);
    }
  });

  const response = await api.post('/catalog/books/create/', formData, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};
```

### Завантаження довідкових даних
```javascript
// Жанри
const { data: genres } = useQuery({
  queryKey: ["genres"],
  queryFn: catalogAPI.fetchGenres,
});

// Теги
const { data: tags } = useQuery({
  queryKey: ["tags"],
  queryFn: catalogAPI.fetchTags,
});

// Країни
const { data: countries } = useQuery({
  queryKey: ["countries"],
  queryFn: catalogAPI.fetchCountries,
});

// Фандоми
const { data: fandoms } = useQuery({
  queryKey: ["fandoms"],
  queryFn: catalogAPI.fetchFandoms,
});
```

## Валідація

### Frontend валідація
```javascript
const validateForm = () => {
  const newErrors = {};

  if (!formData.title?.trim()) {
    newErrors.title = "Назва книги обов'язкова";
  }

  if (!formData.author?.trim()) {
    newErrors.author = "Ім'я автора обов'язкове";
  }

  if (formData.description && formData.description.split(" ").length > 250) {
    newErrors.description = "Опис не може перевищувати 250 слів";
  }

  if (!formData.genres.length) {
    newErrors.genres = "Виберіть хоча б один жанр";
  }

  if (!formData.country) {
    newErrors.country = "Виберіть країну";
  }

  if (!formData.original_status) {
    newErrors.original_status = "Оберіть статус випуску оригіналу";
  }

  if (formData.book_type === "TRANSLATION" && !formData.translation_status) {
    newErrors.translation_status = "Оберіть статус перекладу";
  }

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Backend валідація
```python
def validate(self, data):
    book_type = data.get('book_type')
    
    if book_type == 'AUTHOR':
        data['translation_status'] = None
    elif book_type == 'TRANSLATION':
        data['translation_status'] = 'TRANSLATING'
        
    if not data.get('title'):
        raise serializers.ValidationError({"title": "Назва книги обов'язкова"})
        
    if not data.get('author'):
        raise serializers.ValidationError({"author": "Ім'я автора обов'язкове"})
        
    return data
```

## Захист доступу

### Компонент TranslatorAccessGuard
```javascript
const TranslatorAccessGuard = ({ children }) => {
  const currentUser = useSelector(state => state.auth.user);
  const userProfile = useSelector(state => state.auth.userProfile);

  const isTranslator = userProfile?.role === 'Перекладач' || userProfile?.role === 'Літератор';
  const isReader = userProfile?.role === 'Читач';

  if (!currentUser) {
    toast.error('Для доступу до цієї сторінки необхідна авторизація');
    return <Navigate to="/login" replace />;
  }

  if (isReader) {
    toast.error('Ця функція доступна користувачам сайту, які належать до Перекладач або Літератор...');
    return <Navigate to="/profile" replace />;
  }

  if (isTranslator) {
    return children;
  }

  return <Navigate to="/profile" replace />;
};
```

## Обробка помилок

### Frontend обробка помилок
```javascript
const createBookMutation = useMutation({
  mutationFn: catalogAPI.createBook,
  onSuccess: () => {
    toast.success("Книга успішно створена!");
    navigate("/catalog");
  },
  onError: (error) => {
    toast.error(error.message || "Помилка при створенні книги");
    setIsSubmitting(false);
  },
});
```

### Backend обробка помилок
```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_book(request):
    try:
        serializer = BookCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            book = serializer.save(
                owner=request.user,
                creator=request.user
            )
            
            # Обробка масивів
            if 'genres[]' in request.data:
                genres_ids = request.data.getlist('genres[]')
                book.genres.set(genres_ids)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(
            {'error': serializer.errors}, 
            status=status.HTTP_400_BAD_REQUEST
        )
            
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
```

## Безпека

### Авторизація
- Всі запити на створення книг вимагають JWT токен
- Перевірка ролі користувача (Перекладач/Літератор)
- Валідація даних на frontend та backend

### Валідація файлів
```javascript
const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    if (!file.type.startsWith("image/")) {
      toast.error("Будь ласка, завантажте зображення");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error("Розмір файлу не повинен перевищувати 5MB");
      return;
    }
    setFormData({ ...formData, image: file });
    setImagePreview(URL.createObjectURL(file));
  }
};
```

## Статуси та переходи

### Статуси перекладу
- `TRANSLATING` - Перекладається
- `WAITING` - В очікуванні розділів
- `PAUSED` - Перерва
- `ABANDONED` - Покинутий

### Статуси оригіналу
- `ONGOING` - Виходить
- `STOPPED` - Припинено
- `COMPLETED` - Завершений

## Тестування

### Unit тести
- Валідація форми
- Перевірка ролей користувачів
- Обробка помилок API

### Integration тести
- Створення книги через API
- Перевірка збереження в базі даних
- Валідація зв'язків між моделями

## Моніторинг

### Логування
- Помилки створення книг
- Успішні операції
- Валідаційні помилки

### Метрики
- Кількість створених книг
- Час обробки запитів
- Частота помилок
