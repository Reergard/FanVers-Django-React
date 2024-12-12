from rest_framework import serializers
from ..models import Advertisement
from apps.catalog.api.serializers import BookReaderSerializer
from apps.users.api.serializers import UserSerializer

class AdvertisementSerializer(serializers.ModelSerializer):
    book_details = BookReaderSerializer(source='book', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)
    
    class Meta:
        model = Advertisement
        fields = [
            'id', 
            'book',
            'book_details',
            'user',
            'user_details',
            'location', 
            'start_date',
            'end_date',
            'total_cost',
            'is_active',
            'created_at'
        ]
        read_only_fields = ['total_cost', 'is_active', 'created_at', 'user']

    def validate(self, data):
        """
        Проверка валидности дат и других условий
        """
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError(
                'Дата початку не може бути пізніше дати закінчення'
            )
        
        # Проверка на пересечение дат
        overlapping_ads = Advertisement.objects.filter(
            location=data['location'],
            start_date__lte=data['end_date'],
            end_date__gte=data['start_date'],
            is_active=True
        )
        
        if self.instance:
            overlapping_ads = overlapping_ads.exclude(pk=self.instance.pk)
            
        if overlapping_ads.exists():
            raise serializers.ValidationError(
                'На вибрані дати вже є активна реклама'
            )
            
        return data
