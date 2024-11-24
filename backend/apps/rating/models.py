from django.db import models
from django.conf import settings
from apps.catalog.models import Book


class Rating(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    score = models.PositiveIntegerField()  # Рейтинг от 1 до 10
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'book')
        verbose_name = "Рейтинг"
        verbose_name_plural = "Рейтинги"
