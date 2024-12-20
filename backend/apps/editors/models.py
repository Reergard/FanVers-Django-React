from django.db import models
from apps.catalog.models import Chapter, Volume
from django.core.exceptions import ValidationError
from django.conf import settings


class ChapterEdit(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='edits')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='chapter_edits/', null=True, blank=True)
    volume = models.ForeignKey(Volume, on_delete=models.SET_NULL, null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    edited_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if not self.title and not self.file:
            raise ValidationError("Необхідно змінити хоча б одне поле")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

class ErrorReport(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    book = models.ForeignKey('catalog.Book', on_delete=models.CASCADE)
    chapter = models.ForeignKey('catalog.Chapter', on_delete=models.CASCADE)
    error_text = models.TextField('Текст з помилкою')
    suggestion = models.TextField('Пропозиція щодо виправлення')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = 'Повідомлення про помилку'
        verbose_name_plural = 'Повідомлення про помилки'
        ordering = ['-created_at']

    def __str__(self):
        return f'Помилка в {self.chapter.title} (книга: {self.book.title})'

    @property
    def user_username(self):
        return self.user.username

    @property
    def book_title(self):
        return self.book.title

    @property
    def chapter_title(self):
        return self.chapter.title
