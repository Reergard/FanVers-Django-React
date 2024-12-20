from django.db import transaction
from django.core.exceptions import ValidationError
from apps.users.models import Profile, BalanceLog
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

class BalanceOperationMixin:
    MIN_DEPOSIT_AMOUNT = 100
    MIN_WITHDRAW_AMOUNT = 1000

    @transaction.atomic
    def perform_balance_operation(self, profile, amount, operation_type):
        try:
            if operation_type == 'deposit' and amount < self.MIN_DEPOSIT_AMOUNT:
                raise ValidationError(f'Мінімальна сума поповнення: {self.MIN_DEPOSIT_AMOUNT} грн')
            
            if operation_type == 'withdraw' and amount < self.MIN_WITHDRAW_AMOUNT:
                raise ValidationError(f'Мінімальна сума виведення: {self.MIN_WITHDRAW_AMOUNT} грн')

            profile = Profile.objects.select_for_update().get(id=profile.id)
            
            if operation_type in ['withdraw', 'purchase']:
                if profile.balance < amount:
                    raise ValidationError('Недостатньо коштів')
                profile.balance -= amount
            elif operation_type in ['deposit', 'earning']:
                profile.balance += amount
            else:
                raise ValidationError('Невідомий тип операції')
                
            profile.save()
            
            # Логіруємо операцію з балансом
            if operation_type in ['deposit', 'withdraw']:
                from apps.monitoring.models import BalanceOperationLog
                BalanceOperationLog.objects.create(
                    profile=profile,
                    amount=amount,
                    operation_type=operation_type,
                    status='completed'
                )

            return profile.balance

        except Exception as e:
            if operation_type in ['deposit', 'withdraw']:
                from apps.monitoring.models import BalanceOperationLog
                BalanceOperationLog.objects.create(
                    profile=profile,
                    amount=amount,
                    operation_type=operation_type,
                    status='failed'
                )
            raise