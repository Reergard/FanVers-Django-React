from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg
from ..models import BookRating
from .serializers import BookRatingSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.catalog.models import Book
from django.db import models

class BookRatingViewSet(viewsets.ModelViewSet):
    serializer_class = BookRatingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return BookRating.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    serializer.errors, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['GET'])
    def book_ratings(self, request, book_slug=None):
        try:
            book_slug = book_slug or request.query_params.get('book_slug')
            if not book_slug:
                return Response(
                    {'error': 'Book slug is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            book = get_object_or_404(Book, slug=book_slug)
            
            ratings = BookRating.objects.filter(book=book)
            
            # Отримуємо статистику за рейтингом книги
            book_ratings = ratings.filter(rating_type='BOOK')
            book_rating_stats = book_ratings.aggregate(
                avg_rating=Avg('rating'),
                total_votes=models.Count('id')
            )
            
            # Отримуємо статистику за рейтингом перекладу
            translation_ratings = ratings.filter(rating_type='TRANSLATION')
            translation_rating_stats = translation_ratings.aggregate(
                avg_rating=Avg('rating'),
                total_votes=models.Count('id')
            )

            user_ratings = None
            if request.user.is_authenticated:
                user_ratings = ratings.filter(user=request.user).values(
                    'rating_type', 'rating'
                )

            return Response({
                'book_rating': {
                    'average': book_rating_stats['avg_rating'] or 0,
                    'total_votes': book_rating_stats['total_votes']
                },
                'translation_rating': {
                    'average': translation_rating_stats['avg_rating'] or 0,
                    'total_votes': translation_rating_stats['total_votes']
                },
                'user_ratings': list(user_ratings) if user_ratings else None
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )