from django.contrib.auth import authenticate
from django.contrib.auth.models import User, Group
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging
from django.db import transaction

from apps.users.api.serializers import (
    ProfileSerializer, 
    TranslatorListSerializer, 
    UsersProfilesSerializer,
    CreateUserSerializer
)
from apps.users.models import Profile
from .throttling import ProfileThrottle

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
# @throttle_classes([ProfileThrottle])  # Розкоментувати на продакшені
def save_token_view(request):
    """Збереження FCM токену для push-сповіщень"""
    token = request.data.get('token')
    user = request.user
    if user.is_authenticated and token:
        profile = user.profile
        profile.token = token
        profile.save()
        return Response({'message': 'Токен успішно збережено'})
    return Response(
        {'message': 'Невірний токен або користувач'}, 
        status=status.HTTP_400_BAD_REQUEST
    )


class RegisterView(APIView):
    # throttle_classes = [ProfileThrottle]  # Розкоментувати на продакшені

    def post(self, request):
        serializer = CreateUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': serializer.data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    # throttle_classes = [ProfileThrottle]  # Розкоментувати на продакшені

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
        return Response(
            {'error': 'Невірні облікові дані'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    # throttle_classes = [ProfileThrottle]  # Розкоментувати на продакшені

    def post(self, request):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(status=status.HTTP_205_RESET_CONTENT)
            return Response(
                {'error': 'Потрібен refresh token'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            logger.error(f"Помилка виходу: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Невірний токен'}, 
                status=status.HTTP_400_BAD_REQUEST
            )


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    # throttle_classes = [ProfileThrottle]  # Розкоментувати на продакшені

    def get(self, request):
        try:
            requested_username = request.query_params.get('username')
            if requested_username:
                profile = Profile.objects.select_related('user').get(
                    user__username=requested_username
                )
            else:
                profile = request.user.profile
            
            is_owner = not requested_username or requested_username == request.user.username
            
            serializer = ProfileSerializer(
                profile, 
                context={
                    'is_owner': is_owner,
                    'request': request
                }
            )
            
            return Response(serializer.data)
            
        except Profile.DoesNotExist:
            return Response(
                {'error': 'Профіль не знайдено'}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Помилка в UserProfileView: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Внутрішня помилка сервера'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    # throttle_classes = [ProfileThrottle]  # Розкоментувати на продакшені

    def get_object(self):
        return self.request.user.profile


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
# @throttle_classes([ProfileThrottle])  # Розкоментувати на продакшені
def update_profile_view(request):
    try:
        profile = request.user.profile
        serializer = ProfileSerializer(
            profile, 
            data=request.data, 
            partial=True,
            context={'request': request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Помилка оновлення профілю: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Помилка при оновленні профілю'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_translators_list(request):
    try:
        # Отримуємо перекладачів за роллю
        translators_by_role = Profile.objects.filter(
            role='Перекладач'
        ).select_related('user')

        # Отримуємо літераторів, які мають книги з типом TRANSLATION
        literators_with_translations = Profile.objects.filter(
            role='Літератор',
            user__owned_books__book_type='TRANSLATION'
        ).select_related('user').distinct()

        # Об'єднуємо результати без використання union
        all_translators = list(translators_by_role) + list(literators_with_translations)
        
        # Видаляємо дублікати
        unique_translators = list({translator.id: translator for translator in all_translators}.values())
        
        serializer = TranslatorListSerializer(unique_translators, many=True)
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Помилка в get_translators_list: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Внутрішня помилка сервера'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
# @throttle_classes([ProfileThrottle])  # Розкоментувати на продакшені
def get_user_profile(request, username):
    try:
        profile = Profile.objects.select_related('user').get(
            user__username=username
        )
        
        serializer = UsersProfilesSerializer(profile)
        return Response(serializer.data)
        
    except Profile.DoesNotExist:
        return Response(
            {'error': 'Профіль не знайдено'}, 
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Помилка в get_user_profile: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Внутрішня помилка сервера'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
# @throttle_classes([ProfileThrottle])  # Розкоментувати на продакшені
def become_translator(request):
    try:
        user = request.user
        profile = user.profile
        
        translator_group = Group.objects.get(name='Перекладач')
        if translator_group in user.groups.all():
            return Response({
                'error': 'Ви вже є перекладачем'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            user.groups.clear()  # Видаляємо всі поточні групи
            user.groups.add(translator_group)
            
            profile.role = 'Перекладач'
            profile.save()
        
        return Response({
            'message': 'Ви успішно стали перекладачем',
            'role': profile.role
        })
    except Exception as e:
        logger.error(f"Помилка в become_translator: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Помилка при зміні ролі'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class AuthStatusView(APIView):
    # throttle_classes = [ProfileThrottle]  # Розкоментувати на продакшені

    def get(self, request):
        return Response({
            'isAuthenticated': request.user.is_authenticated
        })
