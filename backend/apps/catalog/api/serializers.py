from rest_framework import serializers
from apps.catalog.models import Book, Chapter, Genres, Tag, Country, Fandom, Volume, ChapterOrder
from apps.navigation.models import Bookmark 
from django.conf import settings
import logging

logger = logging.getLogger(__name__)


class GenresSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genres
        fields = '__all__'
        depth = 1


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = '__all__'
        depth = 1


class CountrySerializer(serializers.ModelSerializer):
    class Meta:
        model = Country
        fields = '__all__'
        depth = 1


class FandomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fandom
        fields = '__all__'
        depth = 1


class ChapterSerializer(serializers.ModelSerializer):
    is_purchased = serializers.SerializerMethodField()
    volume_title = serializers.SerializerMethodField()
    book_title = serializers.CharField(source='book.title', read_only=True)
    slug = serializers.CharField(read_only=True)
    position = serializers.DecimalField(
        max_digits=10,
        decimal_places=1,
        source='_position',
        required=False,
        coerce_to_string=False
    )
    volume = serializers.PrimaryKeyRelatedField(
        queryset=Volume.objects.all(),
        required=False,
        allow_null=True
    )
    book_slug = serializers.SerializerMethodField()
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        coerce_to_string=False
    )

    class Meta:
        model = Chapter
        fields = [
            'id', 'title', 'book', 'book_title', 'slug', 'file', 
            'is_paid', 'is_purchased', 'volume', 
            'volume_title', 'position', 'book_slug', 'price'
        ]
        read_only_fields = ['id', 'slug', 'is_purchased']

    def get_book_slug(self, obj):
        return obj.book.slug if obj.book else None

    def get_is_purchased(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                return request.user.profile.purchased_chapters.filter(id=obj.id).exists()
            except Exception:
                return False
        return False

    def get_volume_title(self, obj):
        return obj.volume.title if obj.volume else None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['position'] = float(instance._position) if instance._position else 0.0
        representation['price'] = float(instance.price) if instance.price else 1.00
        representation['slug'] = instance.slug
        
        # Перевіряємо існування файлу
        if instance.file:
            try:
                if not instance.file.storage.exists(instance.file.name):
                    representation['file'] = None
            except Exception as e:
                logger.error(f"Помилка перевірки існування файлу: {str(e)}")
                representation['file'] = None
                
        # Додаємо контент
        content = instance.get_html_content()
        if content:
            representation['content'] = content
        else:
            representation['content'] = None
            
        return representation

    def validate(self, data):
        request = self.context.get('request')
        book = self.context.get('book')
        
        if not request or not request.user:
            raise serializers.ValidationError('Необхідна авторизація')
            
        if book and book.owner != request.user:
            raise serializers.ValidationError('У вас немає прав для додавання глав до цієї книги')
            
        return data


class BookOwnerSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    owner_username = serializers.SerializerMethodField()
    creator_username = serializers.SerializerMethodField()
    translation_status_display = serializers.CharField(source='get_translation_status_display', read_only=True)
    original_status_display = serializers.CharField(source='get_original_status_display', read_only=True)
    translation_status = serializers.CharField(
        required=False,
        allow_null=True
    )
    genres = GenresSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    fandoms = FandomSerializer(many=True, read_only=True)
    country = CountrySerializer(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'title_en', 'author', 'description', 'image',
            'translation_status', 'translation_status_display',
            'original_status', 'original_status_display',
            'country', 'slug', 'last_updated', 'owner', 'creator',
            'adult_content', 'owner_username', 'creator_username', 'book_type',
            'genres', 'tags', 'fandoms'
        ]
        read_only_fields = ['slug', 'last_updated', 'owner', 'creator']

    def validate(self, data):
        book_type = data.get('book_type')
        
        if book_type == 'AUTHOR':
            data['translation_status'] = None
        elif book_type == 'TRANSLATION':
            current_status = data.get('translation_status')
            data['translation_status'] = current_status or 'TRANSLATING'
        
        return data

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_owner_username(self, obj):
        return obj.owner.username if obj.owner else None

    def get_creator_username(self, obj):
        return obj.creator.username if obj.creator else None

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['owner'] = request.user
            validated_data['creator'] = request.user
        return super().create(validated_data)


class BookReaderSerializer(serializers.ModelSerializer):
    bookmark_status = serializers.SerializerMethodField()
    bookmark_id = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    owner_username = serializers.SerializerMethodField()
    creator_username = serializers.SerializerMethodField()
    translation_status_display = serializers.CharField(source='get_translation_status_display', read_only=True)
    original_status_display = serializers.CharField(source='get_original_status_display', read_only=True)
    translation_status = serializers.CharField(read_only=True)
    original_status = serializers.CharField(read_only=True)
    chapters_count = serializers.SerializerMethodField()
    genres = GenresSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    fandoms = FandomSerializer(many=True, read_only=True)
    country = CountrySerializer(read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'title_en', 'author', 'description', 'image',
            'translation_status', 'translation_status_display', 
            'original_status', 'original_status_display',
            'country', 'slug', 'last_updated', 'owner_username', 
            'creator_username', 'bookmark_status', 'bookmark_id', 
            'adult_content', 'book_type', 'chapters_count',
            'genres', 'tags', 'fandoms'
        ]
        read_only_fields = fields

    def get_chapters_count(self, obj):
        return obj.chapters.count()

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def get_bookmark_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            bookmark = Bookmark.objects.filter(
                book=obj,
                user=request.user
            ).first()
            return bookmark.status if bookmark else None
        return None

    def get_bookmark_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            bookmark = Bookmark.objects.filter(
                book=obj,
                user=request.user
            ).first()
            return bookmark.id if bookmark else None
        return None

    def get_owner_username(self, obj):
        return obj.owner.username if obj.owner else None

    def get_creator_username(self, obj):
        return obj.creator.username if obj.creator else None


class VolumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volume
        fields = ['id', 'title', 'book']


class ChapterOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChapterOrder
        fields = ['id', 'volume', 'chapter', 'position']


class BookCreateSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False)
    translation_status = serializers.CharField(required=False, allow_null=True)
    genres = serializers.PrimaryKeyRelatedField(
        queryset=Genres.objects.all(),
        many=True,
        required=False
    )
    tags = serializers.PrimaryKeyRelatedField(
        queryset=Tag.objects.all(),
        many=True,
        required=False
    )
    fandoms = serializers.PrimaryKeyRelatedField(
        queryset=Fandom.objects.all(),
        many=True,
        required=False
    )
    country = serializers.PrimaryKeyRelatedField(
        queryset=Country.objects.all(),
        required=True
    )

    class Meta:
        model = Book
        fields = [
            'title', 'title_en', 'author', 'description', 'image',
            'translation_status', 'original_status', 'country',
            'genres', 'tags', 'fandoms', 'adult_content', 'book_type'
        ]

    def validate(self, data):
        book_type = data.get('book_type')
        
        if book_type == 'AUTHOR':
            data['translation_status'] = None
        elif book_type == 'TRANSLATION':
            data['translation_status'] = 'TRANSLATING'
            
        if not data.get('title'):
            raise serializers.ValidationError({"title": "Назва книги обов'язкова"})
            
        if not data.get('author'):
            raise serializers.ValidationError({"author": "Ім'я автора обов'язкове"})
            
        return data

    def create(self, validated_data):
        genres = validated_data.pop('genres', [])
        tags = validated_data.pop('tags', [])
        fandoms = validated_data.pop('fandoms', [])
        
        book = Book.objects.create(**validated_data)
        
        if genres:
            book.genres.set(genres)
        if tags:
            book.tags.set(tags)
        if fandoms:
            book.fandoms.set(fandoms)
            
        return book

