import uuid
from django.db import models, transaction
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, Group
from django.utils.translation import gettext_lazy as _
from .managers import CustomUserManager
from django.core.exceptions import ValidationError
from .middleware import get_current_request

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Sum
from django.core.cache import cache
from django.db.models import Count, Q, F


def generate_token():
    return str(uuid.uuid4())


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(_("Логін"), max_length=20, unique=True)
    email = models.EmailField(_("Email"), max_length=254)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    token = models.CharField(max_length=255, default=generate_token)

    USERNAME_FIELD = "username"
    REQUIRED_FIELDS = ["email"]

    objects = CustomUserManager()

    class Meta:
        verbose_name = _("Користувач")
        verbose_name_plural = _("Користувачі")

    def __str__(self):
        return self.email


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.CharField(max_length=50, blank=True, null=True)
    email = models.EmailField(max_length=50, unique=True)
    about = models.TextField(blank=True, null=True)
    image = models.ImageField(null=True, blank=True, default='users/profile_images/no_image.jpg', upload_to='users/profile_images/')
    created = models.DateTimeField(auto_now_add=True)
    token = models.CharField(max_length=255, default=generate_token)
    is_default = models.BooleanField(default=False)
    balance = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        default=0,
        verbose_name='Баланс'
    )
    purchased_chapters = models.ManyToManyField('catalog.Chapter', blank=True, related_name='purchased_by')
    role = models.CharField(
        max_length=20,
        choices=[
            ('Читач', 'Читач'), 
            ('Перекладач', 'Перекладач'),
            ('Літератор', 'Літератор')
        ],
        default='Читач',
        verbose_name='Роль користувача'
    )
    commission = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=15.00,
        verbose_name='Комісія (%)'
    )

    class Meta:
        verbose_name = 'Профіль'
        verbose_name_plural = 'Профілі'

    def __str__(self):
        if self.image:
            return f"Id:{self.id}, {self.user.username}, Image:{self.image.url}"
        else:
            return f"Id:{self.id}, {self.user.username}"

    def update_balance(self, amount, operation_type):
        with transaction.atomic():
            if operation_type == 'withdraw' and self.balance < amount:
                raise ValidationError('Недостатньо коштів')
            
            if operation_type in ['withdraw', 'purchase', 'advertising']:
                self.balance -= amount
            else:
                self.balance += amount
            
            self.save()
            
            balance_log = self.balance_logs.create(
                amount=amount,
                operation_type=operation_type,
                status='completed'
            )
            
            return balance_log
    
    def can_perform_operation(self, operation_type, amount=None):
        if operation_type == 'withdraw':
            return self.balance >= amount
        return True
    
    @property
    def is_owner(self):
        request = get_current_request()
        if request and request.user:
            return self.user == request.user
        return False
    
    @property
    def total_balance_operations(self):
        return self.balance_logs.all()
    
    def get_balance_history(self, operation_type=None):
        """Отримання історії операцій з балансом"""
        logs = self.balance_logs.all()
        if operation_type:
            logs = logs.filter(operation_type=operation_type)
        return logs

    def save(self, *args, **kwargs):
        # Якщо це новий профіль без ролі, встановлюємо роль з групи
        if not self.role:
            groups = self.user.groups.all()
            self.role = 'Перекладач' if groups.filter(name='Перекладач').exists() else 'Читач'
        
        # Якщо роль змінилася, оновлюємо групи
        if self.pk:  # Якщо об'єкт вже існує
            old_profile = Profile.objects.get(pk=self.pk)
            if old_profile.role != self.role:
                self.user.groups.clear()
                group, _ = Group.objects.get_or_create(name=self.role)
                self.user.groups.add(group)
        
        super().save(*args, **kwargs)

    def update_commission(self):
        """Оновлення комісії на основі кількості символів"""
        total_chars = self.user.owned_books.aggregate(
            total=models.Sum('chapters__characters_count')
        )['total'] or 0

        if total_chars >= 10000000:  # 10 мільйонів
            self.commission = 10.00
        elif total_chars >= 5000000:  # 5 мільйонів
            self.commission = 12.00
        else:
            self.commission = 15.00
        self.save(update_fields=['commission'])

    def calculate_commission_amount(self, price):
        """Розрахунок суми комісії"""
        return price * (self.commission / 100)

    def get_reading_stats(self):
        """Отримання статистики читання з використанням кешу"""
        cache_key = f'user_reading_stats_{self.user.id}'
        stats = cache.get(cache_key)
        
        if stats is None:
            from apps.monitoring.models import UserChapterProgress
            from apps.catalog.models import Book
            
            # Підрахунок прочитаних та придбаних глав
            read_chapters = UserChapterProgress.objects.filter(
                user=self.user, 
                is_read=True
            ).count()
            
            purchased_chapters = UserChapterProgress.objects.filter(
                user=self.user, 
                is_purchased=True
            ).count()
            
            # Підрахунок повністю прочитаних книг
            books = Book.objects.annotate(
                total_chapters=Count('chapters'),
                read_chapters=Count(
                    'chapters',
                    filter=Q(
                        chapters__reader_progress__user=self.user,
                        chapters__reader_progress__is_read=True
                    )
                )
            ).filter(total_chapters__gt=0)
            
            completed_books = books.filter(
                total_chapters=F('read_chapters')
            ).count()
            
            stats = {
                'read_chapters': read_chapters,
                'purchased_chapters': purchased_chapters,
                'completed_books': completed_books
            }
            
            # Кешуємо на 1 годину
            cache.set(cache_key, stats, 3600)
            
        return stats

    def clear_reading_stats_cache(self):
        """Очищення кешу статистики читання"""
        cache_key = f'user_reading_stats_{self.user.id}'
        cache.delete(cache_key)


class BalanceLog(models.Model):
    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name='balance_logs'
    )
    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    operation_type = models.CharField(
        max_length=20,
        choices=[
            ('deposit', 'Поповнення'),
            ('withdraw', 'Виведення'),
            ('purchase', 'Покупка'),
            ('earning', 'Заробіток'),
            ('advertising', 'Реклама')
        ]
    )
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', 'В обробці'),
            ('completed', 'Завершено'),
            ('failed', 'Помилка')
        ],
        default='pending'
    )
    
    class Meta:
        ordering = ['-created_at']


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(
            user=instance,
            username=instance.username,
            email=instance.email
        )
        reader_group = Group.objects.get(name='Читач')
        instance.groups.add(reader_group)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()


@receiver(post_save, sender='catalog.Chapter')
def update_user_commission(sender, instance, **kwargs):
    if instance.book and instance.book.owner:
        profile = instance.book.owner.profile
        profile.update_commission()


@receiver(post_save, sender='monitoring.UserChapterProgress')
def clear_reading_stats_cache(sender, instance, **kwargs):
    """Очищення кешу статисти��и при оновленні прогресу читання"""
    if instance.user and hasattr(instance.user, 'profile'):
        instance.user.profile.clear_reading_stats_cache()
