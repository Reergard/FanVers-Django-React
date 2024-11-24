from django.db import models
from apps.catalog.models import Chapter, Volume
from django.core.exceptions import ValidationError

# Create your models here.

class ChapterEdit(models.Model):
    chapter = models.ForeignKey(Chapter, on_delete=models.CASCADE, related_name='edits')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='chapter_edits/', null=True, blank=True)
    volume = models.ForeignKey(Volume, on_delete=models.SET_NULL, null=True, blank=True)
    is_paid = models.BooleanField(default=False)
    edited_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if not self.title and not self.file:
            raise ValidationError("Необходимо изменить хотя бы одно поле")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)
