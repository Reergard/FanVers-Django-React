from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.catalog.models import Chapter, Book
from ..models import UserChapterProgress
from .serializers import UserChapterProgressSerializer, UserReadingStatsSerializer
from django.utils import timezone
from django.contrib.auth.models import User
from django.db import models
from apps.navigation.models import Bookmark

class ChapterProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, chapter_id):
        chapter = get_object_or_404(Chapter, id=chapter_id)
        progress = UserChapterProgress.objects.filter(
            user=request.user,
            chapter=chapter
        ).first()
        
        serializer = UserChapterProgressSerializer(progress)
        return Response(serializer.data)

    def post(self, request, chapter_id):
        chapter = get_object_or_404(Chapter, id=chapter_id)
        reading_time = float(request.data.get('reading_time', 0))
        scroll_progress = float(request.data.get('scroll_progress', 0))

        progress, created = UserChapterProgress.objects.get_or_create(
            user=request.user,
            chapter=chapter
        )

        # Завжди оновлюємо час читання та позицію прокрутки
        progress.reading_time = reading_time
        progress.scroll_position = scroll_progress
        progress.last_read_at = timezone.now()

        # Перевіряємо умови для зарахування прочитання
        min_reading_time = chapter.min_reading_time
        is_time_valid = reading_time >= min_reading_time
        is_scroll_valid = scroll_progress >= 90

        if not progress.is_read and is_scroll_valid and is_time_valid:
            progress.is_read = True
            progress.reading_speed = chapter.character_count / reading_time

            # Перевіряємо, чи всі глави книги прочитані
            book = chapter.book
            total_chapters = book.chapters.count()
            read_chapters = UserChapterProgress.objects.filter(
                user=request.user,
                chapter__book=book,
                is_read=True
            ).count()

            progress.save()
            response_data = UserChapterProgressSerializer(progress).data
            response_data['book_completed'] = (total_chapters == read_chapters)
            return Response(response_data)

        progress.save()
        return Response(UserChapterProgressSerializer(progress).data)

class UserReadingStatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        profile = user.profile

        # Підрахунок придбаних глав
        purchased_chapters = profile.purchased_chapters.count()
        
        # Підрахунок прочитаних глав
        read_chapters = UserChapterProgress.objects.filter(
            user=user,
            is_read=True
        ).count()
        
        # Підрахунок книг зі статусом "completed"
        completed_books = Bookmark.objects.filter(
            user=user,
            status='completed'
        ).count()

        stats = {
            'purchased_chapters': purchased_chapters,
            'read_chapters': read_chapters,
            'completed_books': completed_books
        }

        return Response(stats)