from django.db import transaction
from django.core.exceptions import ValidationError
from apps.users.models import Profile, BalanceLog
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class BalanceOperationMixin:
    MAX_OPERATION_AMOUNT = 10000  # Максимальная сумма операции

    @transaction.atomic
    def perform_balance_operation(self, profile, amount, operation_type):
        try:
            if amount > self.MAX_OPERATION_AMOUNT:
                raise ValidationError(f'Максимальна сума операції: {self.MAX_OPERATION_AMOUNT}')

            profile = Profile.objects.select_for_update().get(id=profile.id)
            
            if operation_type in ['withdraw', 'purchase']:
                if profile.balance < amount:
                    raise ValidationError('Недостатньо коштів')
                profile.balance -= amount
            elif operation_type == 'deposit':
                profile.balance += amount
            else:
                raise ValidationError('Невідомий тип операції')
                
            profile.save()
            
            # Создаем запись в логе с дополнительной информацией
            BalanceLog.objects.create(
                profile=profile,
                amount=amount,
                operation_type=operation_type,
                status='completed'
            )
            
            return profile.balance
            
        except Profile.DoesNotExist:
            raise ValidationError('Профіль не знайдено')
        except Exception as e:
            logger.error(f"Balance operation error: {str(e)}", exc_info=True)
            if 'profile' in locals():
                BalanceLog.objects.create(
                    profile=profile,
                    amount=amount,
                    operation_type=operation_type,
                    status='failed'
                )
            raise ValidationError('Помилка при операції з балансом') 