from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from apps.users.models import User, Profile, BalanceLog
from apps.catalog.models import Chapter, Book
from django.db import models
import logging
from django.conf import settings
from decimal import Decimal

logger = logging.getLogger(__name__)


class CreateUserSerializer(UserCreateSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}


class BalanceLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = BalanceLog
        fields = ['amount', 'operation_type', 'created_at', 'status']


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

    class Meta:
        model = Profile
        fields = ['id', 'username', 'about', 'image', 'role',
                 'total_characters', 'total_chapters', 'free_chapters', 
                 'total_author', 'total_translations', 'is_owner', 'balance_history', 'commission']

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


