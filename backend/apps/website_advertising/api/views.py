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

# Настраиваем логгер
logger = logging.getLogger(__name__)

class AdvertisementViewSet(viewsets.ModelViewSet):
    serializer_class = AdvertisementSerializer
    permission_classes = [IsAuthenticated]
    queryset = Advertisement.objects.all()
    
    def get_queryset(self):
        logger.info(f"Getting advertisements for user: {self.request.user.id}")
        return Advertisement.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def calculate_cost(self, request):
        logger.info(f"Received calculate_cost request with data: {request.data}")
        try:
            # Получаем текущую дату в UTC
            current_date = timezone.now().date()
            logger.info(f"Current date: {current_date}")

            # Парсим даты из запроса
            start_date_str = request.data['start_date']
            end_date_str = request.data['end_date']
            
            # Преобразуем строки в объекты date
            start_date = parser.parse(start_date_str).date()
            end_date = parser.parse(end_date_str).date()
            
            logger.info(f"""
            Date comparison:
            Current date: {current_date}
            Start date: {start_date}
            End date: {end_date}
            """)
            
            # Проверяем, что начальная дата не раньше текущей
            if start_date < current_date:
                logger.warning(
                    f"Invalid start date: {start_date} is before current date {current_date}. "
                    f"Raw start date from request: {start_date_str}"
                )
                return Response(
                    {'error': 'Дата початку не може бути раніше поточної дати'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Проверяем порядок дат
            if end_date < start_date:
                logger.warning(f"End date {end_date} is before start date {start_date}")
                return Response(
                    {'error': 'Дат закінчення не може бути раніше дати початку'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Расчет стоимости
            cost_per_day = 30
            days = (end_date - start_date).days
            if days == 0:  # Если реклама в один день
                days = 1
            total_cost = days * cost_per_day
            
            logger.info(f"""
            Cost calculation:
            Days between dates: {days}
            Cost per day: {cost_per_day}
            Total cost: {total_cost}
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
            logger.error(f"Error in calculate_cost: {str(e)}", exc_info=True)
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    def perform_create(self, serializer):
        logger.info("Starting advertisement creation...")
        logger.info(f"Received data: {serializer.validated_data}")
        
        try:
            user = self.request.user
            profile = user.profile  # Получаем профиль пользователя
            logger.info(f"Creating advertisement for user: {user.id}, profile balance: {profile.balance}")
            
            start_date = serializer.validated_data['start_date']
            end_date = serializer.validated_data['end_date']
            book = serializer.validated_data['book']
            
            logger.info(f"Advertisement details: start={start_date}, end={end_date}, book={book.id}")
            
            # Расчет стоимости
            days = (end_date - start_date).days
            if days == 0:
                days = 1
            total_cost = days * 30
            
            logger.info(f"Cost calculation: days={days}, total_cost={total_cost}")
            
            # Проверка баланса через профиль
            if profile.balance < total_cost:  # Используем profile.balance вместо user.balance
                logger.warning(f"Insufficient funds: balance={profile.balance}, required={total_cost}")
                raise serializers.ValidationError({
                    'error': 'Недостатньо коштів на балансі',
                    'balance': float(profile.balance),
                    'required': float(total_cost)
                })
            
            # Списание средств через профиль
            profile.update_balance(-total_cost)  # Используем метод update_balance из модели Profile
            
            # Сохранение рекламы
            ad = serializer.save(
                user=user,
                total_cost=total_cost
            )
            logger.info(f"Advertisement created successfully: {ad.id}")
            
            return ad
            
        except Exception as e:
            logger.error(f"Error in perform_create: {str(e)}", exc_info=True)
            raise

    @action(detail=False, methods=['get'])
    def main_page_ads(self, request):
        logger.info("Fetching main page advertisements...")
        try:
            current_date = timezone.now().date()
            logger.info(f"Current date: {current_date}")
            
            ads = self.queryset.filter(
                start_date__lte=current_date,
                end_date__gte=current_date,
                location='main'
            ).select_related('book')
            
            logger.info(f"Found {ads.count()} active advertisements")
            
            serializer = self.get_serializer(ads, many=True)
            logger.info("Advertisements serialized successfully")
            
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error in main_page_ads: {str(e)}", exc_info=True)
            raise
