from rest_framework import serializers
from ..models import Notification
from apps.catalog.api.serializers import BookReaderSerializer

class NotificationSerializer(serializers.ModelSerializer):
    book = BookReaderSerializer()
    error_report_id = serializers.IntegerField(source='error_report.id', read_only=True, allow_null=True)
    reporter_username = serializers.CharField(source='error_report.user.username', read_only=True, allow_null=True)
    book_title = serializers.CharField(source='book.title', read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = [
            'id', 
            'message', 
            'created_at', 
            'is_read', 
            'book',
            'error_report_id',
            'reporter_username',
            'book_title'
        ]

    def to_representation(self, instance):
        try:
            return super().to_representation(instance)
        except Exception:
            return {
                'id': instance.id,
                'message': instance.message,
                'created_at': instance.created_at,
                'is_read': instance.is_read,
                'book': None,
                'error_report_id': None,
                'reporter_username': None,
                'book_title': None
            }