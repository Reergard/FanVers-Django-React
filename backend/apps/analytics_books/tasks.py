from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import DailyAnalytics

@shared_task
def cleanup_old_analytics():
    """
    Периодическая задача для очистки старых данных аналитики
    По умолчанию удаляет данные старше 90 дней
    """
    days = 90
    cutoff_date = timezone.now().date() - timedelta(days=days)
    
    deleted_count = DailyAnalytics.objects.filter(
        date__lt=cutoff_date
    ).delete()[0]
    
    return f'Удалено {deleted_count} записей старше {days} дней' 