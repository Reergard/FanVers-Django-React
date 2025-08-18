from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from django.contrib.auth import get_user_model
from apps.users.models import Profile, BalanceLog
from apps.catalog.models import Chapter, Book
from django.db import models
import logging
from django.conf import settings
from decimal import Decimal
from django.contrib.auth.password_validation import validate_password

logger = logging.getLogger(__name__)

# Получаем модель User через get_user_model()
User = get_user_model()


class CreateUserSerializer(UserCreateSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}


class CurrentUserSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    balance = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'balance', 'image')
    
    def get_username(self, obj):
        return obj.profile.username

    def get_balance(self, obj):
        return obj.profile.balance

    def get_image(self, obj):
        request = self.context.get('request')
        url = obj.profile.get_profile_image('small')
        return request.build_absolute_uri(url) if request else url


class BalanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BalanceLog
        fields = ['amount', 'operation_type', 'created_at', 'status']


class ProfileImageUploadSerializer(serializers.Serializer):
    """Сериализатор для загрузки изображения профиля"""
    image = serializers.ImageField(required=True)
    
    def validate_image(self, value):
        # Проверяем размер файла (максимум 5MB)
        if value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("Розмір файлу не може перевищувати 5MB")
        
        # Проверяем формат файла
        allowed_formats = ['image/jpeg', 'image/png', 'image/webp']
        if value.content_type not in allowed_formats:
            raise serializers.ValidationError("Підтримуються тільки формати: JPEG, PNG, WebP")
        
        return value


class EmailUpdateSerializer(serializers.Serializer):
    """Сериализатор для обновления email"""
    new_email = serializers.EmailField(required=True)
    
    def validate_new_email(self, value):
        user = self.context['request'].user
        # 1) уникальность среди пользователей
        if User.objects.filter(email=value).exclude(id=user.id).exists():
            raise serializers.ValidationError("Цей email вже використовується іншим користувачем")
        # 2) уникальность среди профилей
        if Profile.objects.filter(email=value).exclude(user_id=user.id).exists():
            raise serializers.ValidationError("Цей email вже використовується іншим користувачем (профіль)")
        return value


class PasswordChangeSerializer(serializers.Serializer):
    """Сериализатор для смены пароля"""
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_password = serializers.CharField(required=True)
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Невірний поточний пароль")
        return value
    
    def validate_new_password(self, value):
        # Валидация нового пароля
        validate_password(value, self.context['request'].user)
        return value
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError("Новий пароль та підтвердження не співпадають")
        return data


class NotificationSettingsSerializer(serializers.ModelSerializer):
    """Сериализатор для настроек сповіщений"""
    class Meta:
        model = Profile
        fields = [
            'notifications_enabled',
            'hide_adult_content', 
            'private_messages_enabled',
            'age_confirmed',
            'comment_notifications',
            'translation_status_notifications',
            'chapter_subscription_notifications',
            'chapter_comment_notifications'
        ]


class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    total_characters = serializers.SerializerMethodField()
    total_chapters = serializers.SerializerMethodField()
    free_chapters = serializers.SerializerMethodField()
    total_author = serializers.SerializerMethodField()
    total_translations = serializers.SerializerMethodField()
    is_owner = serializers.SerializerMethodField()
    balance_history = serializers.SerializerMethodField()
    commission = serializers.DecimalField(max_digits=5, decimal_places=2, read_only=True)
    read_chapters = serializers.SerializerMethodField()
    purchased_chapters = serializers.SerializerMethodField()
    completed_books = serializers.SerializerMethodField()
    profile_image_small = serializers.SerializerMethodField()
    profile_image_large = serializers.SerializerMethodField()
    has_custom_image = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'about', 'image', 'role',
                 'total_characters', 'total_chapters', 'free_chapters', 
                 'total_author', 'total_translations', 'is_owner', 'balance_history', 'commission',
                 'read_chapters', 'purchased_chapters', 'completed_books',
                 'profile_image_small', 'profile_image_large', 'has_custom_image',
                 'notifications_enabled', 'hide_adult_content', 'private_messages_enabled', 'age_confirmed',
                 'comment_notifications', 'translation_status_notifications', 
                 'chapter_subscription_notifications', 'chapter_comment_notifications']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        is_owner = request and request.user == self.instance.user

        # Добавляем чувствительные поля только для владельца
        if is_owner:
            self.fields['email'] = serializers.EmailField(source='user.email')
            self.fields['balance'] = serializers.DecimalField(
                max_digits=10, 
                decimal_places=2
            )
            self.fields['balance_history'] = serializers.SerializerMethodField()

    def get_is_owner(self, obj):
        return obj.is_owner

    def get_balance_history(self, obj):
        if obj.is_owner:
            return BalanceLogSerializer(
                obj.get_balance_history(),
                many=True
            ).data
        return None

    def get_profile_image_small(self, obj):
        """Отримання маленького зображення профілю з fallback"""
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.get_profile_image('small'))
        return obj.get_profile_image('small')
    
    def get_profile_image_large(self, obj):
        """Отримання великого зображення профілю з fallback"""
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.get_profile_image('large'))
        return obj.get_profile_image('large')
    
    def get_has_custom_image(self, obj):
        """Перевірка чи є кастомне зображення"""
        return obj.has_custom_image()

    def get_total_characters(self, obj):
        return Chapter.objects.filter(book__owner=obj.user).aggregate(
            total=models.Sum('characters_count'))['total'] or 0

    def get_total_chapters(self, obj):
        return Chapter.objects.filter(book__owner=obj.user).count()

    def get_free_chapters(self, obj):
        return Chapter.objects.filter(book__owner=obj.user, price=0).count()

    def get_total_author(self, obj):
        return Book.objects.filter(
            owner=obj.user,
            book_type='AUTHOR'
        ).count()

    def get_role(self, obj):
        user_groups = obj.user.groups.all()
        if user_groups.filter(name='Перекладач').exists():
            return 'Перекладач'
        return 'Читач'

    def get_total_translations(self, obj):
        return Book.objects.filter(
            owner=obj.user,
            book_type='TRANSLATION'
        ).count()

    def get_read_chapters(self, obj):
        from apps.monitoring.models import UserChapterProgress
        return UserChapterProgress.objects.filter(
            user=obj.user, 
            is_read=True
        ).count()

    def get_purchased_chapters(self, obj):
        from apps.monitoring.models import UserChapterProgress
        return UserChapterProgress.objects.filter(
            user=obj.user, 
            is_purchased=True
        ).count()

    def get_completed_books(self, obj):
        from django.db.models import Count, Q, F
        from apps.catalog.models import Book
        
        books = Book.objects.annotate(
            total_chapters=Count('chapters'),
            read_chapters=Count(
                'chapters',
                filter=Q(
                    chapters__user_progress__user=obj.user,
                    chapters__user_progress__is_read=True
                )
            )
        ).filter(total_chapters__gt=0)
        
        return books.filter(
            total_chapters=F('read_chapters')
        ).count()

    def to_representation(self, instance):
        try:
            data = super().to_representation(instance)
            if instance.image:
                data['image'] = instance.image.url
            return data
        except Exception as e:
            logger.error(f"Error in ProfileSerializer: {str(e)}", exc_info=True)
            raise


class TranslatorListSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    image = serializers.ImageField(required=False, allow_null=True)
    translation_books_count = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'role', 'image', 'translation_books_count']

    def get_translation_books_count(self, obj):
        return obj.user.owned_books.filter(book_type='TRANSLATION').count()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if instance.image:
            data['image'] = instance.image.url if instance.image else None
        return data


class UsersProfilesSerializer(serializers.ModelSerializer):
    total_books = serializers.SerializerMethodField()   
    username = serializers.CharField(source='user.username')

    class Meta:
        model = Profile
        fields = ['id', 'username', 'role', 'about', 'image', 'total_books']

    def get_total_books(self, obj):
        return obj.user.owned_books.count()

    def to_representation(self, instance):
        try:
            data = super().to_representation(instance)
            if instance.image:
                data['image'] = instance.image.url
            return data
        except Exception as e:
            logger.error(f"Error in UsersProfilesSerializer: {str(e)}", exc_info=True)
            raise


class BalanceOperationSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        min_value=Decimal('0.01'),
        max_value=Decimal(str(getattr(settings, 'MAX_BALANCE_OPERATION_AMOUNT', 1000000)))
    )
    operation_type = serializers.ChoiceField(choices=['deposit', 'withdraw'])

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Сума повинна бути більше нуля")
        return value

    def validate(self, data):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError("Необхідна авторизація")

        if data['operation_type'] == 'withdraw':
            profile = request.user.profile
            if not profile.can_perform_operation('withdraw', data['amount']):
                raise serializers.ValidationError("Недостатньо коштів для виведення")

        return data


class UpdateBalanceSerializer(serializers.Serializer):
    amount = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        min_value=Decimal('0.01'),
        max_value=Decimal(str(getattr(settings, 'MAX_BALANCE_OPERATION_AMOUNT', 1000000)))
    )

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Сума повинна бути більше нуля")
        return value


