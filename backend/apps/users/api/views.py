from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes, throttle_classes, parser_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework_simplejwt.authentication import JWTAuthentication
import logging
from django.db import transaction
from django.contrib.auth import update_session_auth_hash
from django.core.files.storage import default_storage
import os
import time

logger = logging.getLogger(__name__)

from apps.users.api.serializers import (
    ProfileSerializer, 
    TranslatorListSerializer, 
    AuthorListSerializer,
    UsersProfilesSerializer,
    CreateUserSerializer,
    ProfileImageUploadSerializer,
    EmailUpdateSerializer,
    PasswordChangeSerializer,
    NotificationSettingsSerializer
)
from apps.users.models import Profile
from .throttling import ProfileThrottle, ProfileImageUploadThrottle

# Получаем модель User через get_user_model()
User = get_user_model()


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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([ProfileImageUploadThrottle])
@parser_classes([MultiPartParser, FormParser])
def upload_profile_image(request):
    """Завантаження зображення профілю з покращеною безпекою"""
    try:
        serializer = ProfileImageUploadSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            # Використовуємо метод save з serializer'а
            profile = serializer.save()
            
            return Response({
                'message': 'Зображення профілю успішно оновлено',
                'image_url': request.build_absolute_uri(profile.image.url) + f'?v={int(time.time())}',
                'has_custom_image': True
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Помилка завантаження зображення: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Помилка при завантаженні зображення'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_profile_image(request):
    """Видалення зображення профілю"""
    try:
        profile = request.user.profile
        
        if profile.image:
            # Використовуємо storage з profile.image для кращої сумісності
            storage = profile.image.storage
            if storage.exists(profile.image.name):
                storage.delete(profile.image.name)
            
            # Просто очищаем поле image
            profile.image = None
            profile.save(update_fields=['image'])
            
            return Response({'message': 'Зображення профілю успішно видалено'})
        
        return Response(
            {'error': 'Зображення профілю не знайдено'}, 
            status=status.HTTP_404_NOT_FOUND
        )
        
    except Exception as e:
        logger.error(f"Помилка видалення зображення: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Помилка при видаленні зображення'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class UpdateEmailView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    http_method_names = ['post', 'options']
    # throttle_classes = [ProfileThrottle]  # Розкоментувати на продакшені

    def post(self, request):
        try:
            serializer = EmailUpdateSerializer(data=request.data, context={'request': request})
            
            if serializer.is_valid():
                user = request.user
                new_email = serializer.validated_data['new_email']
                
                # Оновлюємо email в User - Profile.email оновиться автоматично через сигнал
                old_email = user.email
                user.email = new_email
                
                # Сохраняем с указанием конкретного поля для избежания конфликтов
                user.save(update_fields=['email'])
                
                response_data = {
                    'message': 'Email успішно оновлено',
                    'new_email': new_email
                }
                return Response(response_data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error in update_email: {str(e)}", exc_info=True)
            return Response(
                {'error': 'Помилка при оновленні email'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Зміна пароля користувача"""
    try:
        serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = request.user
            new_password = serializer.validated_data['new_password']
            
            # Змінюємо пароль
            user.set_password(new_password)
            user.save()
            
            # Оновлюємо сесію
            update_session_auth_hash(request, user)
            
            return Response({'message': 'Пароль успішно змінено'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Помилка зміни пароля: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Помилка при зміні пароля'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_notification_settings(request):
    """Оновлення налаштувань сповіщений"""
    try:
        profile = request.user.profile
        serializer = NotificationSettingsSerializer(
            profile, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Налаштування сповіщений успішно оновлено',
                'settings': serializer.data
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        logger.error(f"Помилка оновлення налаштувань: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Помилка при оновленні налаштувань'}, 
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
def get_authors_list(request):
    try:
        # Додаємо діагностичне логування
        total_profiles = Profile.objects.count()
        total_literators = Profile.objects.filter(role='Літератор').count()
        total_translators = Profile.objects.filter(role='Перекладач').count()
        total_readers = Profile.objects.filter(role='Читач').count()
        
        logger.info(f"Діагностика ролей: Всього профілів: {total_profiles}, "
                   f"Літераторів: {total_literators}, "
                   f"Перекладачів: {total_translators}, "
                   f"Читачів: {total_readers}")
        
        # Отримуємо тільки літераторів (перевіряємо обидва варіанти)
        authors = Profile.objects.filter(
            role__in=['Літератор', 'Литератор', 'Author']
        ).select_related('user').prefetch_related(
            'user__created_books',
            'user__owned_books'
        )
        
        logger.info(f"Знайдено літераторів: {authors.count()}")
        
        # Сортуємо за кількістю авторських книг (спочатку ті, у кого більше книг)
        authors_list = list(authors)
        authors_list.sort(
            key=lambda x: x.user.created_books.filter(book_type='AUTHOR').count(),
            reverse=True
        )
        
        serializer = AuthorListSerializer(authors_list, many=True)
        logger.info(f"Успішно серіалізовано {len(serializer.data)} авторів")
        return Response(serializer.data)
        
    except Exception as e:
        logger.error(f"Помилка в get_authors_list: {str(e)}", exc_info=True)
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
        
        translator_group, _ = Group.objects.get_or_create(name='Перекладач')
        if user.groups.filter(name='Перекладач').exists():
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
# @throttle_classes([ProfileThrottle])  # Розкоментувати на продакшені
def become_author(request):
    try:
        user = request.user
        profile = user.profile
        
        author_group, _ = Group.objects.get_or_create(name='Літератор')
        if user.groups.filter(name='Літератор').exists():
            return Response({
                'error': 'Ви вже є літератором'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            user.groups.clear()  # Видаляємо всі поточні групи
            user.groups.add(author_group)
            
            profile.role = 'Літератор'
            profile.save()
        
        return Response({
            'message': 'Ви успішно стали літератором',
            'role': profile.role
        })
    except Exception as e:
        logger.error(f"Помилка в become_author: {str(e)}", exc_info=True)
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
