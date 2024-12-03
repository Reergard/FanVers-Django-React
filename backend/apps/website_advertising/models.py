from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from apps.catalog.models import Book
from apps.users.models import User

class Advertisement(models.Model):
    LOCATION_CHOICES = [
        ('main', 'Реклама на Головній'),
        ('genres', 'Реклама у Пошуку за жанрами'),
        ('tags', 'Реклама у Пошуку за тегами'),
        ('fandoms', 'Реклама у Пошуку за фендомами'),
    ]

    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name='advertisements')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='advertisements')
    location = models.CharField(max_length=20, choices=LOCATION_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField()
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        if self.start_date < timezone.now().date():
            raise ValidationError('Дата початку не може бути раніше поточної дати')
        if self.end_date < self.start_date:
            raise ValidationError('Дата закінчення не може бути раніше дати початку')
        
        # Проверка на пересечение дат
        overlapping_ads = Advertisement.objects.filter(
            location=self.location,
            start_date__lte=self.end_date,
            end_date__gte=self.start_date,
            is_active=True
        )
        if self.pk:
            overlapping_ads = overlapping_ads.exclude(pk=self.pk)
        if overlapping_ads.exists():
            raise ValidationError('На вибрані дати вже є активна реклама')

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
