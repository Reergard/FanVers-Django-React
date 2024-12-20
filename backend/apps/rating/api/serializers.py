from rest_framework import serializers
from ..models import BookRating
from apps.catalog.models import Book

class BookRatingSerializer(serializers.ModelSerializer):
    book_slug = serializers.CharField(write_only=True)
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = BookRating
        fields = ['id', 'book_slug', 'rating_type', 'rating', 'user']

    def create(self, validated_data):
        book_slug = validated_data.pop('book_slug')
        try:
            book = Book.objects.get(slug=book_slug)
            validated_data['book'] = book
            
            # Перевіряємо існування рейтингу
            existing_rating = BookRating.objects.filter(
                book=book,
                user=validated_data['user'],
                rating_type=validated_data['rating_type']
            ).first()
            
            if existing_rating:
                # Оновлюємо існуючий рейтинг
                existing_rating.rating = validated_data['rating']
                existing_rating.save()
                return existing_rating
                
            return super().create(validated_data)
        except Book.DoesNotExist:
            raise serializers.ValidationError({"book_slug": "Книгу не знайдено"})

    def validate_rating_type(self, value):
        if value not in ['BOOK', 'TRANSLATION']:
            raise serializers.ValidationError(
                "Тип рейтингу має бути 'BOOK' або 'TRANSLATION'"
            )
        return value

    def validate_rating(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError("Рейтинг має бути від 1 до 5")
        return value