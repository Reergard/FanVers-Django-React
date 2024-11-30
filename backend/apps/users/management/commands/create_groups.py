from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from apps.catalog.models import Book, Chapter
from apps.users.models import User

class Command(BaseCommand):
    help = 'Створення базових груп користувачів'

    def handle(self, *args, **options):
        # Створюємо групи
        reader_group, created = Group.objects.get_or_create(name='Читач')
        translator_group, created = Group.objects.get_or_create(name='Перекладач')
        author_group, created = Group.objects.get_or_create(name='Автор')
        moderator_group, created = Group.objects.get_or_create(name='Модератор')
        writer_group, created = Group.objects.get_or_create(name='Літератор')

        # Отримуємо типи контенту
        book_content_type = ContentType.objects.get_for_model(Book)
        chapter_content_type = ContentType.objects.get_for_model(Chapter)
        user_content_type = ContentType.objects.get_for_model(User)

        # Базові права для читачів
        reader_permissions = [
            Permission.objects.get(codename='view_book', content_type=book_content_type),
            Permission.objects.get(codename='view_chapter', content_type=chapter_content_type),
        ]
        reader_group.permissions.set(reader_permissions)

        # Права для перекладачів
        translator_permissions = [
            *reader_permissions,  # Всі права читача
            Permission.objects.get(codename='add_chapter', content_type=chapter_content_type),
            Permission.objects.get(codename='change_chapter', content_type=chapter_content_type),
        ]
        translator_group.permissions.set(translator_permissions)

        # Права для літераторів
        writer_permissions = [
            *reader_permissions,  # Всі права читача
            Permission.objects.get(codename='add_book', content_type=book_content_type),
            Permission.objects.get(codename='change_book', content_type=book_content_type),
            Permission.objects.get(codename='add_chapter', content_type=chapter_content_type),
            Permission.objects.get(codename='change_chapter', content_type=chapter_content_type),
            Permission.objects.get(codename='delete_chapter', content_type=chapter_content_type),
        ]
        writer_group.permissions.set(writer_permissions)

        self.stdout.write(self.style.SUCCESS('Групи користувачів успішно створені')) 