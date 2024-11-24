from rest_framework import serializers
from apps.reviews.models import BookComment, ChapterComment
from django.contrib.auth import get_user_model
from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from django.shortcuts import get_object_or_404
from apps.catalog.models import Book, Chapter  # Добавьте импорт Chapter

User = get_user_model()

class BaseCommentSerializer(serializers.ModelSerializer):
    likes_count = serializers.SerializerMethodField()
    dislikes_count = serializers.SerializerMethodField()
    user_reaction = serializers.SerializerMethodField()
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    def get_likes_count(self, obj):
        return obj.get_likes_count()

    def get_dislikes_count(self, obj):
        return obj.get_dislikes_count()

    def get_user_reaction(self, obj):
        user = self.context['request'].user
        if user.is_authenticated:
            if user in obj.likes.all():
                return 'like'
            elif user in obj.dislikes.all():
                return 'dislike'
        return None

class BookCommentSerializer(BaseCommentSerializer):
    replies = serializers.SerializerMethodField()
    book = serializers.SlugRelatedField(slug_field='slug', read_only=True)

    class Meta:
        model = BookComment
        fields = ['id', 'book', 'user', 'text', 'parent', 'created_at', 'likes_count', 'dislikes_count', 'user_reaction', 'replies']
        read_only_fields = ['id', 'created_at', 'likes_count', 'dislikes_count', 'user_reaction', 'replies']

    def get_replies(self, obj):
        if obj.replies.exists():
            return BookCommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

    def create(self, validated_data):
        book_slug = self.context['view'].kwargs.get('slug')
        book = get_object_or_404(Book, slug=book_slug)
        validated_data['book'] = book
        return super().create(validated_data)

class ChapterCommentSerializer(BaseCommentSerializer):
    replies = serializers.SerializerMethodField()
    chapter = serializers.SlugRelatedField(slug_field='slug', read_only=True)

    class Meta:
        model = ChapterComment
        fields = ['id', 'chapter', 'user', 'text', 'parent', 'created_at', 'likes_count', 'dislikes_count', 'user_reaction', 'replies']
        read_only_fields = ['id', 'created_at', 'likes_count', 'dislikes_count', 'user_reaction', 'replies']

    def get_replies(self, obj):
        if obj.replies.exists():
            return ChapterCommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []

    def create(self, validated_data):
        chapter_slug = self.context['view'].kwargs.get('slug')
        chapter = get_object_or_404(Chapter, slug=chapter_slug)
        validated_data['chapter'] = chapter
        return super().create(validated_data)
