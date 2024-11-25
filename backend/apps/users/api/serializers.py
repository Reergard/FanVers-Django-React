from rest_framework import serializers
from djoser.serializers import UserCreateSerializer
from apps.users.models import User, Profile


class CreateUserSerializer(UserCreateSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}


class ProfileSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['id', 'username', 'email', 'about', 'image', 'balance', 'role']

    def get_role(self, obj):
        user_groups = obj.user.groups.all()
        if user_groups.filter(name='Перекладач').exists():
            return 'Перекладач'
        return 'Читач'


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


