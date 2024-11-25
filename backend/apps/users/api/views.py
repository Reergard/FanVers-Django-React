from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth.models import Group

from apps.users.api.serializers import ProfileSerializer, UpdateBalanceSerializer
from apps.catalog.models import Chapter


@api_view(['POST'])
def save_token_view(request):
    token = request.data.get('token')
    user = request.user
    if user.is_authenticated and token:
        profile = user.profile
        profile.token = token
        profile.save()
        return Response({'message': 'Token saved successfully'})
    return Response({'message': 'Invalid token or user'}, status=status.HTTP_400_BAD_REQUEST)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user


class RegisterView(APIView):
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def post(self, request):
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    if user:
        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        })
    return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def get(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile)
        return Response(serializer.data)


class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)




class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.profile


@api_view(['PUT'])
def update_profile_view(request):
    user = request.user
    if user.is_authenticated:
        profile = user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    return Response(status=status.HTTP_401_UNAUTHORIZED)


class AuthStatusView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            return Response({'isAuthenticated': True})
        return Response({'isAuthenticated': False})


class AddBalanceView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        amount = request.data.get('amount')
        try:
            amount = int(amount)
            profile = request.user.profile
            profile.balance += amount
            profile.save()
            return Response({'balance': profile.balance})
        except (ValueError, TypeError):
            return Response({'error': 'Invalid amount'}, status=400)


class PurchaseChapterView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, chapter_id):
        chapter = get_object_or_404(Chapter, id=chapter_id)
        profile = request.user.profile

        if profile.balance <= 0:
            return Response({
                'error': 'Недостатній баланс'
            }, status=400)

        if not chapter.is_paid:
            return Response({
                'error': 'Глава безкоштовна'
            }, status=400)

        if profile.purchased_chapters.filter(id=chapter.id).exists():
            return Response({
                'error': 'Глава вже куплена'
            }, status=400)

        profile.balance -= 1
        profile.purchased_chapters.add(chapter)
        profile.save()

        return Response({
            'balance': profile.balance,
            'message': 'Глава успішно придбана',
            'is_purchased': True
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_balance(request):
    serializer = UpdateBalanceSerializer(data=request.data)
    if serializer.is_valid():
        amount = serializer.validated_data['amount']
        profile = request.user.profile
        profile.balance += amount
        profile.save()
        return Response({
            'message': 'Баланс успішно оновлено',
            'new_balance': profile.balance
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def become_translator(request):
    user = request.user
    profile = user.profile
    reader_group = Group.objects.get(name='Читач')
    translator_group = Group.objects.get(name='Перекладач')
    
    if translator_group in user.groups.all():
        return Response({
            'error': 'Ви вже є перекладачем'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.groups.remove(reader_group)
    user.groups.add(translator_group)
    
    profile.role = 'Перекладач'
    profile.save()
    
    return Response({
        'message': 'Ви успішно стали перекладачем',
        'role': profile.role
    })
