#!/usr/bin/env python
import os
import sys
import django

# Добавляем путь к проекту
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Настраиваем Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FanVers_project.settings')
django.setup()

from apps.catalog.models import Chapter
from django.db import models

# Проверяем главы
chapters_with_chars = Chapter.objects.filter(characters_count__gt=0).count()
total_chars = Chapter.objects.aggregate(total=models.Sum('characters_count'))['total'] or 0

print(f'Главы с символами: {chapters_with_chars}')
print(f'Общее количество символов: {total_chars}')

# Проверяем конкретные главы
print('\nДетали глав:')
for chapter in Chapter.objects.all()[:5]:
    print(f'Глава: {chapter.title}, Символов: {chapter.characters_count}, HTML: {bool(chapter.html_content)}')
