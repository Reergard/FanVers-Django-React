from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from apps.users.models import User, Profile
from apps.catalog.models import Chapter, Book
from django.db import models
import logging

logger = logging.getLogger(__name__)


class CreateUserSerializer(UserCreateSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}


class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    total_characters = serializers.SerializerMethodField()
    total_chapters = serializers.SerializerMethodField()
    free_chapters = serializers.SerializerMethodField()
    total_author = serializers.SerializerMethodField()
    total_translations = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'about', 'image', 'balance', 'role',
                 'total_characters', 'total_chapters', 'free_chapters', 
                 'total_author', 'total_translations']

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


class TranslatorListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'username', 'role', 'image']

    def to_representation(self, instance):
        try:
            data = super().to_representation(instance)
            if instance.image:
                data['image'] = instance.image.url
            return data
        except Exception as e:
            logger.error(f"Error in TranslatorListSerializer: {str(e)}", exc_info=True)
            raise


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




class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']


class UpdateBalanceSerializer(serializers.Serializer):
    amount = serializers.IntegerField(min_value=1)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Сума повинна бути більше нуля")
        return value


class BalanceOperationSerializer(serializers.Serializer):
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, min_value=0.01)

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Сума повинна бути більше нуля")
        return value


