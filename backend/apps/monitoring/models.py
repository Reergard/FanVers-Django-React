from django.db import models
from apps.users.models import Profile
from apps.catalog.models import Chapter, Book

class TransactionLog(models.Model):
    buyer = models.ForeignKey(
        Profile, 
        on_delete=models.CASCADE,
        related_name='purchases'
    )
    owner = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='sales'
    )
    chapter = models.ForeignKey(
        Chapter,
        on_delete=models.CASCADE
    )
    book = models.ForeignKey(
        Book,
        on_delete=models.CASCADE
    )
    original_price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    commission_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2
    )
    commission_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    final_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

class BalanceOperationLog(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='balance_operations'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    operation_type = models.CharField(
        max_length=20,
        choices=[
            ('deposit', 'Поповнення'),
            ('withdraw', 'Виведення')
        ]
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('completed', 'Завершено'),
            ('failed', 'Помилка')
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Balance Operation Log'
        verbose_name_plural = 'Balance Operation Logs'

    def __str__(self):
        return f"{self.operation_type} by {self.profile.user.username}"