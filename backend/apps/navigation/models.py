from django.db import models
from django.contrib.auth import get_user_model
from apps.catalog.models import Book

User = get_user_model()

class Bookmark(models.Model):
    STATUS_CHOICES = [
        ('reading', 'Читаю'),
        ('dropped', 'Кинув читати'),
        ('planned', 'В планах'),
        ('completed', 'Прочитав'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="bookmarks")
    book = models.ForeignKey(Book, on_delete=models.CASCADE, related_name="bookmarks")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'book')
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.user.username} - {self.book.title} ({self.status})"
