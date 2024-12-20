import logging
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from datetime import datetime
from .serializers import AdvertisementSerializer
from ..models import Advertisement
from apps.users.models import User
from dateutil import parser
from zoneinfo import ZoneInfo
from rest_framework.throttling import UserRateThrottle


logger = logging.getLogger(__name__)

class AdvertisementThrottle(UserRateThrottle):
    rate = '60/minute'

class AdvertisementViewSet(viewsets.ModelViewSet):
    serializer_class = AdvertisementSerializer
    # throttle_classes = [AdvertisementThrottle]  # Розкоментувати на продакшені
    queryset = Advertisement.objects.all()
    
    def get_permissions(self):
        if self.action == 'main_page_ads':
            return []  # Публічний доступ для main_page_ads
        return [IsAuthenticated()]  # Авторизація для інших дій

    def get_queryset(self):
        logger.info(f"Отримання реклами для користувача: {self.request.user.id}")
        return Advertisement.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def calculate_cost(self, request):
        logger.info(f"Отримано запит на розрахунок вартості з даними: {request.data}")
        try:
            # Отримуємо поточну дату в UTC
            current_date = timezone.now().date()
            logger.info(f"Поточна дата: {current_date}")

            # Парсимо дати із запиту
            start_date_str = request.data['start_date']
            end_date_str = request.data['end_date']
            
            # Перетворюємо рядки в об'єкти date
            start_date = parser.parse(start_date_str).date()
            end_date = parser.parse(end_date_str).date()
            
            logger.info(f"""
            Порівняння дат:
            Поточна дата: {current_date}
            Дата початку: {start_date}
            Дата закінчення: {end_date}
            """)
            
            # Перевіряємо, що початкова дата не раніше поточної
            if start_date < current_date:
                logger.warning(
                    f"Невірна дата початку: {start_date} раніше поточної дати {current_date}. "
                    f"Початкова дата із запиту: {start_date_str}"
                )
                return Response(
                    {'error': 'Дата початку не може бути раніше поточної дати'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Перевіряємо порядок дат
            if end_date < start_date:
                logger.warning(f"Дата закінчення {end_date} раніше дати початку {start_date}")
                return Response(
                    {'error': 'Дата закінчення не може бути раніше дати початку'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Розрахунок вартості
            cost_per_day = 30
            days = (end_date - start_date).days
            if days == 0:  # Якщо реклама в один день
                days = 1
            total_cost = days * cost_per_day
            
            logger.info(f"""
            Розрахунок вартості:
            Днів між датами: {days}
            Вартість за день: {cost_per_day}
            Загальна вартість: {total_cost}
            """)
            
            return Response({
                'total_cost': total_cost,
                'days': days,
                'cost_per_day': cost_per_day,
                'debug_info': {
                    'current_date': str(current_date),
                    'start_date': str(start_date),
                    'end_date': str(end_date),
                }
            })
            
        except Exception as e:
            logger.error(f"Помилка в calculate_cost: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        logger.info("Початок створення реклами...")
        logger.info(f"Отримані дані: {serializer.validated_data}")
        
        try:
            user = self.request.user
            profile = user.profile  # Отримуємо профіль користувача
            logger.info(f"Створення реклами для користувача: {user.id}, баланс профілю: {profile.balance}")
            
            start_date = serializer.validated_data['start_date']
            end_date = serializer.validated_data['end_date']
            book = serializer.validated_data['book']
            
            logger.info(f"Деталі реклами: початок={start_date}, кінець={end_date}, книга={book.id}")
            
            # Розрахунок вартості
            days = (end_date - start_date).days
            if days == 0:
                days = 1
            total_cost = days * 30
            
            logger.info(f"Розрахунок вартості: днів={days}, загальна вартість={total_cost}")
            
            # Перевірка балансу через профіль
            if profile.balance < total_cost:
                logger.warning(f"Недостатньо коштів: баланс={profile.balance}, потрібно={total_cost}")
                raise serializers.ValidationError({
                    'error': 'Недостатньо коштів на балансі',
                    'balance': float(profile.balance),
                    'required': float(total_cost)
                })
            
            # Списання коштів через профіль
            profile.update_balance(-total_cost)
            
            # Збереження реклами
            ad = serializer.save(
                user=user,
                total_cost=total_cost
            )
            logger.info(f"Реклама успішно створено: {ad.id}")
            
            return ad
            
        except Exception as e:
            logger.error(f"Помилка в perform_create: {str(e)}", exc_info=True)
            raise

    @action(detail=False, methods=['get'])
    def main_page_ads(self, request):
        logger.info("Отримання реклами для головної сторінки...")
        try:
            current_date = timezone.now().date()
            logger.info(f"Поточна дата: {current_date}")
            
            ads = self.queryset.filter(
                start_date__lte=current_date,
                end_date__gte=current_date,
                location='main'
            ).select_related('book')
            
            logger.info(f"Знайдено {ads.count()} активних реклам")
            
            serializer = self.get_serializer(ads, many=True)
            logger.info("Реклама успішно серіалізовано")
            
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Помилка в main_page_ads: {str(e)}", exc_info=True)
            raise
