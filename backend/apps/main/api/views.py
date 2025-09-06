from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.catalog.models import Book, Chapter
from .serializers import BooksNewsSerializer
from django.utils import timezone
from django.db.models import Max, Q
from datetime import timedelta
import logging

logger = logging.getLogger(__name__)

def index(request):
    return render(request, "main/index.html")


def home_data(request):
    data = {
        "title": "Ласкаво просимо до UAtranslate",
        "description": "Місце де ви знайдете фанфік або новелу на свій смак. ",
    }
    return JsonResponse(data)

@api_view(['GET'])
def books_news(request):
    """
    API для получения новых книг (для HomePage2.js).
    
    Логика:
    1. Все книги, отсортированные по дате создания (новые сверху)
    2. Ограничение: 10 записей
    3. Показывает последние созданные книги
    """
    logger.info("=== Початок виконання функції books_news (новые книги) ===")
    
    try:
        # Получаем все книги, отсортированные по дате создания
        new_books = Book.objects.all().order_by('-created_at')[:10]
        
        logger.info(f"Знайдено нових книг: {new_books.count()}")
        
        # Логируем детали для отладки
        for book in new_books:
            logger.info(f"""
                Книга ID: {book.id}
                Назва: {book.title}
                Створена: {book.created_at}
                Кількість глав: {book.chapters.count()}
            """)
            
        serializer = BooksNewsSerializer(new_books, many=True, context={'request': request})
        logger.info(f"Дані після серіалізації: {len(serializer.data)} книг")
        
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Помилка при отриманні нових книг: {str(e)}", exc_info=True)
        return Response({"error": "Помилка при завантаженні нових книг"}, status=500)


@api_view(['GET'])
def books_recent_updates(request):
    """
    API для получения книг с недавними обновлениями глав (для HomePage3.js).
    
    Логика:
    1. Книги созданы больше суток назад
    2. Имеют главы с недавними обновлениями
    3. Сортировка по времени последнего обновления главы
    4. Ограничение: 10 записей
    """
    logger.info("=== Початок виконання функції books_recent_updates ===")
    
    try:
        # Время сутки назад
        one_day_ago = timezone.now() - timedelta(days=1)
        
        # ВРЕМЕННО: для тестирования убираем ограничение по времени создания книги
        # Получаем книги с недавними обновлениями глав
        # Сначала получаем ID книг с недавними обновлениями
        recent_book_ids = Book.objects.filter(
            # ВРЕМЕННО ЗАКОММЕНТИРОВАНО: Книга создана больше суток назад
            # created_at__lt=one_day_ago,
            # Имеет главы с недавними обновлениями
            chapters__created_at__gte=one_day_ago
        ).values_list('id', flat=True).distinct()
        
        logger.info(f"Знайдено ID книг з недавними оновленнями: {list(recent_book_ids)}")
        
        # Теперь получаем книги с аннотациями по этим ID
        books_with_recent_chapters = Book.objects.filter(
            id__in=recent_book_ids
        ).prefetch_related(
            'genres', 'tags', 'fandoms'
        ).annotate(
            # Время последнего обновления главы (самое свежее)
            last_chapter_update=Max('chapters__created_at')
        ).order_by(
            # Сортировка по времени последнего обновления главы (новые сверху)
            '-last_chapter_update'
        )[:10]  # Ограничиваем до 10 записей
        
        logger.info(f"Знайдено унікальних книг з недавними оновленнями: {books_with_recent_chapters.count()}")
        
        # Логируем детали для отладки
        for i, book in enumerate(books_with_recent_chapters, 1):
            logger.info(f"""
                Позиція {i}:
                Книга ID: {book.id}
                Назва: {book.title}
                Створена: {book.created_at}
                Останнє оновлення глави: {book.last_chapter_update}
                Кількість глав: {book.chapters.count()}
            """)
            
        serializer = BooksNewsSerializer(books_with_recent_chapters, many=True, context={'request': request})
        logger.info(f"Дані після серіалізації: {len(serializer.data)} книг")
        
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Помилка при отриманні книг з недавними оновленнями: {str(e)}", exc_info=True)
        return Response({"error": "Помилка при завантаженні рекомендованих книг"}, status=500)


