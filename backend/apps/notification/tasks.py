from celery import shared_task
from FanVers_project.celery import app
from datetime import timedelta
from django.utils import timezone
from apps.catalog.models import Book
from .models import Notification

@shared_task
def check_abandoned_books():
    try:
        hour_ago = timezone.now() - timedelta(minutes=3)
        books_to_update = Book.objects.filter(
            last_updated__lte=hour_ago,
            translation_status='TRANSLATING'
        )

        for book in books_to_update:
            book.translation_status = 'ABANDONED'
            book.save()
            
            if book.owner:
                notification_message = f'Книга "{book.title}" була перенесена в "Покинуті".'
                Notification.objects.create(
                    user=book.owner,
                    book=book,
                    message=notification_message
                )
            
            book.owner = None
            book.save()

    except Exception:
        pass

@shared_task
def send_abandoned_notification():
    try:
        books = Book.objects.filter(
            translation_status='TRANSLATING',
            owner__isnull=False
        )
        
        for book in books:
            if not book.has_recent_activity():
                notification_message = f'Статус книги "{book.title}" буде змінений на "Покинута" через 7 днів.'
                
                existing_notification = Notification.objects.filter(
                    user=book.owner,
                    book=book,
                    created_at__gte=timezone.now() - timedelta(minutes=3),
                    message=notification_message
                ).exists()
                
                if not existing_notification:
                    Notification.objects.create(
                        user=book.owner,
                        book=book,
                        message=notification_message
                    )
    
    except Exception:
        pass

