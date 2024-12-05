from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Avg
from ..models import BookRating
from .serializers import BookRatingSerializer
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from apps.catalog.models import Book

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
            book_rating = ratings.filter(rating_type='BOOK').aggregate(
                avg_rating=Avg('rating')
            )
            translation_rating = ratings.filter(rating_type='TRANSLATION').aggregate(
                avg_rating=Avg('rating')
            )

            user_ratings = None
            if request.user.is_authenticated:
                user_ratings = ratings.filter(user=request.user).values(
                    'rating_type', 'rating'
                )

            return Response({
                'book_rating': book_rating['avg_rating'] or 0,
                'translation_rating': translation_rating['avg_rating'] or 0,
                'user_ratings': list(user_ratings) if user_ratings else None
            })
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_400_BAD_REQUEST
            )