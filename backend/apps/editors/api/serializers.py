from rest_framework import serializers
from apps.editors.models import ChapterEdit
from apps.catalog.models import Chapter, Volume
from apps.catalog.api.serializers import ChapterSerializer
from ..models import ErrorReport
from apps.catalog.models import Book

class ChapterEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChapterEdit
        fields = ['id', 'chapter', 'title', 'file', 'volume', 'is_paid', 'edited_at']


class ErrorReportSerializer(serializers.ModelSerializer):
    book = serializers.PrimaryKeyRelatedField(queryset=Book.objects.all())
    chapter = serializers.PrimaryKeyRelatedField(queryset=Chapter.objects.all())
    book_id = serializers.IntegerField(write_only=True, required=False)
    chapter_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = ErrorReport
        fields = ['id', 'book', 'chapter', 'book_id', 'chapter_id', 
                 'error_text', 'suggestion', 'book_title', 
                 'chapter_title', 'user_username', 'created_at']
        read_only_fields = ['user', 'created_at', 'book_title', 
                           'chapter_title', 'user_username']

    def validate(self, data):
        try:
            # Получаем book и chapter из ID если они предоставлены
            if 'book_id' in data:
                data['book'] = Book.objects.get(id=data['book_id'])
            if 'chapter_id' in data:
                data['chapter'] = Chapter.objects.get(id=data['chapter_id'])
            
            # Используем объекты book и chapter
            book = data['book']
            chapter = data['chapter']
            
            if chapter.book != book:
                raise serializers.ValidationError("Глава не принадлежит указанной книге")
            
            return data
        except (Book.DoesNotExist, Chapter.DoesNotExist):
            raise serializers.ValidationError("Указанная книга или глава не существует")