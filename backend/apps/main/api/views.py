from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from apps.catalog.models import Book
from .serializers import BooksNewsSerializer
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
    logger.info("=== Початок виконання функції books_news ===")
    
    try:
        news_books = Book.objects.all().order_by('-created_at')[:10]
        logger.info(f"Знайдено нових книг: {news_books.count()}")
        
        for book in news_books:
            logger.info(f"""
                Книга ID: {book.id}
                Назва: {book.title}
                Опис: {book.description}
                Зображення: {book.image if book.image else 'Немає зображення'}
            """)
            
        serializer = BooksNewsSerializer(news_books, many=True, context={'request': request})
        logger.info(f"Дані після серіалізації: {serializer.data}")
        
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Помилка при отриманні книг: {str(e)}")
        return Response({"error": str(e)}, status=500)


