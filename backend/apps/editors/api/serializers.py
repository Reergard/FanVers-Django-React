from rest_framework import serializers
from apps.editors.models import ChapterEdit
from apps.catalog.models import Chapter, Volume
from apps.catalog.api.serializers import ChapterSerializer

class ChapterEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChapterEdit
        fields = ['id', 'chapter', 'title', 'file', 'volume', 'is_paid', 'edited_at']
