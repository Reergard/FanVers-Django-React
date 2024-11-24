from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from ..models import Rating
from apps.catalog.models import Book
from .serializers import RatingSerializer
from django.db.models import Avg


class RatingView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            permission_classes = [IsAuthenticated]
        elif self.request.method == 'GET':
            permission_classes = [AllowAny]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]

    def get(self, request, book_slug):
        try:
            # Находим книгу по slug
            book = Book.objects.get(slug=book_slug)

            # Получаем все рейтинги книги
            ratings = Rating.objects.filter(book=book)
            total_score = ratings.aggregate(Avg('score'))['score__avg'] or 0

            # Получаем рейтинг текущего пользователя, если он аутентифицирован
            user_rating = None
            if request.user.is_authenticated:
                user_rating_obj = Rating.objects.filter(book=book, user=request.user).first()
                if user_rating_obj:
                    user_rating = user_rating_obj.score

            # Возвращаем средний рейтинг и рейтинг пользователя (если есть)
            return Response({
                "average_score": total_score,
                "user_rating": user_rating
            }, status=status.HTTP_200_OK)

        except Book.DoesNotExist:
            return Response({"error": "Книга не найдена"}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, book_slug):
        try:
            # Находим книгу по slug
            book = Book.objects.get(slug=book_slug)

            # Получаем оценку из запроса
            score = request.data.get('score')

            # Проверяем, что score является допустимым значением
            if score is None or not (1 <= int(score) <= 10):
                return Response({"error": "Некорректное значение рейтинга"}, status=status.HTTP_400_BAD_REQUEST)

            # Обновляем или создаем рейтинг пользователя для книги
            rating, created = Rating.objects.update_or_create(
                user=request.user,
                book=book,
                defaults={'score': score}
            )

            # Возвращаем сериализованные данные рейтинга
            return Response(RatingSerializer(rating).data, status=status.HTTP_201_CREATED)

        except Book.DoesNotExist:
            return Response({"error": "Книга не найдена"}, status=status.HTTP_404_NOT_FOUND)
