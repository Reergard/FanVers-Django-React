from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from apps.catalog.models import Book, Chapter
from django.core.exceptions import ObjectDoesNotExist
import logging
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from .serializers import BookmarkSerializer
from ..models import Bookmark
from django.shortcuts import get_object_or_404

logger = logging.getLogger(__name__)

class ChapterNavigationView(APIView):
    def get(self, request, book_slug, chapter_slug):
        try:
            book = get_object_or_404(Book, slug=book_slug)
            current_chapter = get_object_or_404(Chapter, book=book, slug=chapter_slug)
            
            # Получаем все главы с информацией о томах
            all_chapters = book.chapters.select_related('volume').all()
            
            # Сортируем главы
            sorted_chapters = sorted(all_chapters, key=lambda x: (
                float('inf') if x.volume is None else x.volume.id,
                x._position
            ))
            
            # Находим индекс текущей главы
            current_index = next(i for i, ch in enumerate(sorted_chapters) if ch.id == current_chapter.id)
            
            prev_chapter = sorted_chapters[current_index - 1] if current_index > 0 else None
            next_chapter = sorted_chapters[current_index + 1] if current_index < len(sorted_chapters) - 1 else None

            # Проверяем статус покупки для каждой главы
            def get_chapter_data(chapter):
                is_purchased = False
                if request.user.is_authenticated:
                    is_purchased = chapter.purchases.filter(user=request.user).exists()
                return {
                    'title': f"Том {chapter.volume.id if chapter.volume else 'без тома'} - {chapter.title}",
                    'slug': chapter.slug,
                    'is_paid': chapter.is_paid,
                    'is_purchased': is_purchased,
                    'id': chapter.id
                }

            navigation_data = {
                'current_chapter': get_chapter_data(current_chapter),
                'prev_chapter': get_chapter_data(prev_chapter) if prev_chapter else None,
                'next_chapter': get_chapter_data(next_chapter) if next_chapter else None,
                'all_chapters': [get_chapter_data(ch) for ch in sorted_chapters]
            }
            
            return Response(navigation_data)
            
        except Exception as e:
            print(f"Ошибка при получении навигации: {str(e)}")
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class BookmarkViewSet(viewsets.ModelViewSet):
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).select_related('book')

    def perform_create(self, serializer):
        # Проверяем, существует ли уже закладка
        existing_bookmark = Bookmark.objects.filter(
            user=self.request.user,
            book_id=serializer.validated_data['book_id']
        ).first()

        if existing_bookmark:
            # Если закладка существует, обновляем её статус
            existing_bookmark.status = serializer.validated_data['status']
            existing_bookmark.save()
            serializer.instance = existing_bookmark
        else:
            # Если закладки нет, создаём новую
            serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='status/(?P<status>.+)')
    def filter_by_status(self, request, status=None):
        queryset = self.get_queryset().filter(status=status)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ..models import Bookmark

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_bookmark_status(request, book_id):
    """
    Получение статуса закладки для конкретной книги
    """
    print(f"Getting bookmark status for book {book_id} and user {request.user}") 
    
    try:
        bookmark = Bookmark.objects.get(book_id=book_id, user=request.user)
        print(f"Found bookmark: {bookmark}")  
        return Response({
            'id': bookmark.id,
            'status': bookmark.status
        })
    except Bookmark.DoesNotExist:
        print(f"No bookmark found") 
        return Response({
            'id': None,
            'status': None
        })
