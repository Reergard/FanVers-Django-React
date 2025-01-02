from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from apps.analytics_books.models import DailyAnalytics

class Command(BaseCommand):
    help = 'Очищает старые данные ежедневной аналитики'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=90,
            help='Количество дней, за которые сохранять данные'
        )

    def handle(self, *args, **options):
        days = options['days']
        cutoff_date = timezone.now().date() - timedelta(days=days)
        
        deleted_count = DailyAnalytics.objects.filter(
            date__lt=cutoff_date
        ).delete()[0]
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Успешно удалено {deleted_count} записей старше {days} дней'
            )
        ) 