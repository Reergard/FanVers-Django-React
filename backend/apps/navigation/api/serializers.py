from rest_framework import serializers
from ..models import Bookmark
from apps.catalog.api.serializers import BookReaderSerializer

class BookmarkSerializer(serializers.ModelSerializer):
    book = BookReaderSerializer(read_only=True)  
    book_id = serializers.IntegerField(write_only=True) 
    
    class Meta:
        model = Bookmark
        fields = ('id', 'book', 'book_id', 'status', 'created_at', 'updated_at')
        depth = 1
