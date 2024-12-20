from rest_framework import serializers
from apps.monitoring.models import UserChapterProgress

class UserChapterProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserChapterProgress
        fields = ['is_read', 'is_purchased', 'scroll_position', 
                 'reading_time', 'last_read_at', 'reading_progress']

class UserReadingStatsSerializer(serializers.Serializer):
    read_chapters = serializers.IntegerField()
    purchased_chapters = serializers.IntegerField()
    completed_books = serializers.IntegerField() 