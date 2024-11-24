from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from apps.users.models import User, Profile


class CreateUserSerializer(UserCreateSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'about', 'image', 'balance']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']


