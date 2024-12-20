from rest_framework import serializers
from apps.catalog.models import Book
import logging

logger = logging.getLogger(__name__)

class BooksNewsSerializer(serializers.ModelSerializer):
    background_image = serializers.SerializerMethodField()
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'description', 'image',
            'slug', 'background_image', 'cover_image',
            'created_at'
        ]

    def get_background_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                logger.info(f"Формування URL для background_image: {obj.image.url}")
                return request.build_absolute_uri(obj.image.url)
        logger.warning(f"Відсутнє зображення для книги {obj.id}")
        return None

    def get_cover_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                logger.info(f"Формування URL для cover_image: {obj.image.url}")
                return request.build_absolute_uri(obj.image.url)
        logger.warning(f"Відсутнє зображення для книги {obj.id}")
        return None

    def to_representation(self, instance):
        logger.debug(f"Серіалізація книги: id={instance.id}, title={instance.title}")
        representation = super().to_representation(instance)
        request = self.context.get('request')
        
        if request:
            if instance.image:
                representation['cover_image'] = request.build_absolute_uri(instance.image.url)
                logger.debug(f"Cover image URL: {representation['cover_image']}")
            else:
                logger.warning(f"У книги id={instance.id} відсутнє зображення")
            
            representation['background_image'] = representation['cover_image']
        else:
            logger.warning("Відсутній об'єкт request в контексті серіалізатора")
        
        return representation
