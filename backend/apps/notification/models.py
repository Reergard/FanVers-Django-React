from django.db import models
from django.conf import settings

class Notification(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    book = models.ForeignKey('catalog.Book', on_delete=models.CASCADE, null=True, blank=True)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    error_report = models.ForeignKey('editors.ErrorReport', on_delete=models.CASCADE, null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['error_report'])
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'error_report'],
                name='unique_user_error_report'
            )
        ]

    def __str__(self):
        return f'Уведомление для {self.user.username}'