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
    logger.info("=== Начало выполнения функции books_news ===")
    
    try:
        news_books = Book.objects.all().order_by('-created_at')[:10]
        logger.info(f"Найдено новых книг: {news_books.count()}")
        
        for book in news_books:
            logger.info(f"""
                Книга ID: {book.id}
                Название: {book.title}
                Описание: {book.description}
                Изображение: {book.image if book.image else 'Нет изображения'}
            """)
            
        serializer = BooksNewsSerializer(news_books, many=True, context={'request': request})
        logger.info(f"Данные после сериализации: {serializer.data}")
        
        return Response(serializer.data)
    except Exception as e:
        logger.error(f"Ошибка при получении книг: {str(e)}")
        return Response({"error": str(e)}, status=500)


