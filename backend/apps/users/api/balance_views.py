from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.core.exceptions import ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.authentication import JWTAuthentication

from .serializers import (
    UpdateBalanceSerializer, 
    BalanceOperationSerializer
)
from .mixins import BalanceOperationMixin
from .throttling import BalanceOperationThrottle
from apps.catalog.models import Chapter
import logging

logger = logging.getLogger(__name__)

class AddBalanceView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]
    #throttle_classes = [BalanceOperationThrottle]

    def post(self, request):
        serializer = UpdateBalanceSerializer(data=request.data)
        if serializer.is_valid():
            try:
                amount = serializer.validated_data['amount']
                balance_mixin = BalanceOperationMixin()
                new_balance = balance_mixin.perform_balance_operation(
                    request.user.profile,
                    amount,
                    'deposit'
                )
                return Response({
                    'message': 'Баланс успішно поповнено',
                    'new_balance': new_balance
                })
            except ValidationError as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
# @throttle_classes([BalanceOperationThrottle])  # Раскомментировать на продакшене
def withdraw_balance(request):
    try:
        amount = float(request.data.get('amount', 0))
        
        logger.info(f"Withdraw request data: {request.data}")
        logger.info(f"Amount after conversion: {amount}")
        
        serializer = BalanceOperationSerializer(
            data={
                'amount': amount,
                'operation_type': 'withdraw'
            },
            context={'request': request}
        )
        
        if serializer.is_valid():
            try:
                amount = serializer.validated_data['amount']
                balance_mixin = BalanceOperationMixin()
                new_balance = balance_mixin.perform_balance_operation(
                    request.user.profile,
                    amount,
                    'withdraw'
                )
                return Response({
                    'message': 'Кошти успішно виведені',
                    'new_balance': new_balance
                })
            except ValidationError as e:
                logger.error(f"Validation error: {str(e)}")
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return Response(
            {'error': 'Неочікувана помилка при виведенні коштів'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([BalanceOperationThrottle])
def update_balance(request):
    serializer = UpdateBalanceSerializer(data=request.data)
    if serializer.is_valid():
        try:
            amount = serializer.validated_data['amount']
            balance_mixin = BalanceOperationMixin()
            new_balance = balance_mixin.perform_balance_operation(
                request.user.profile,
                amount,
                'deposit'
            )
            return Response({
                'message': 'Баланс успішно оновлено',
                'new_balance': new_balance
            })
        except ValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@throttle_classes([BalanceOperationThrottle])
def purchase_chapter(request, chapter_id):
    try:
        chapter = get_object_or_404(Chapter, id=chapter_id)
        user_profile = request.user.profile

        if user_profile.purchased_chapters.filter(id=chapter_id).exists():
            return Response(
                {'error': 'Глава вже придбана'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        balance_mixin = BalanceOperationMixin()
        
        with transaction.atomic():
            # Списываем средства
            new_balance = balance_mixin.perform_balance_operation(
                user_profile,
                chapter.price,
                'purchase'
            )
            # Добавляем главу в купленные
            user_profile.purchased_chapters.add(chapter)

        return Response({
            'message': 'Глава успішно придбана',
            'new_balance': new_balance,
            'chapter_id': chapter_id
        })

    except ValidationError as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error in purchase_chapter: {str(e)}", exc_info=True)
        return Response(
            {'error': 'Внутрішня помилка сервера'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        ) 