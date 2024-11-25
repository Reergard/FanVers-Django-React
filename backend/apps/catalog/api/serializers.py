from rest_framework import serializers
from apps.catalog.models import Book, Chapter, Genres, Tag, Country, Fandom, Volume, ChapterOrder
from apps.navigation.models import Bookmark 
from django.conf import settings


class ChapterSerializer(serializers.ModelSerializer):
    is_purchased = serializers.SerializerMethodField()
    volume_title = serializers.SerializerMethodField()
    position = serializers.DecimalField(
        max_digits=10,
        decimal_places=1,
        source='_position',
        required=False
    )
    volume = serializers.PrimaryKeyRelatedField(
        queryset=Volume.objects.all(),
        required=False,
        allow_null=True
    )
    book_slug = serializers.SerializerMethodField()

    class Meta:
        model = Chapter
        fields = [
            'id', 'title', 'book', 'slug', 'file', 
            'is_paid', 'is_purchased', 'volume', 
            'volume_title', 'position', 'book_slug'
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
        return representation


class BookSerializer(serializers.ModelSerializer):
    bookmark_status = serializers.SerializerMethodField()
    bookmark_id = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    owner_username = serializers.SerializerMethodField()
    creator_username = serializers.SerializerMethodField()
    translation_status_display = serializers.CharField(source='get_translation_status_display', read_only=True)
    original_status_display = serializers.CharField(source='get_original_status_display', read_only=True)

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'title_en', 'author', 'description', 'image',
            'translation_status', 'translation_status_display',
            'original_status', 'original_status_display',
            'country', 'slug', 'last_updated', 'owner', 'creator',
            'bookmark_status', 'bookmark_id',
            'owner_username', 'creator_username'
        ]
        read_only_fields = ['slug', 'last_updated', 'owner', 'creator']

    def validate(self, data):
        if 'country' not in data:
            raise serializers.ValidationError({
                'country': 'Это поле обязательно для заполнения.'
            })
        return data

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

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['owner'] = request.user
            validated_data['creator'] = request.user
        return super().create(validated_data)


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


class VolumeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Volume
        fields = ['id', 'title', 'slug', 'book']


class ChapterOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChapterOrder
        fields = ['id', 'volume', 'chapter', 'position']
