from django.db import migrations, models

class Migration(migrations.Migration):
    dependencies = [
        ('catalog', '0002_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='book',
            name='translation_status',
            field=models.CharField(
                choices=[
                    ('TRANSLATING', 'Перекладається'),
                    ('WAITING', 'В очікуванні розділів'),
                    ('PAUSED', 'Перерва'),
                    ('ABANDONED', 'Покинутий')
                ],
                default='TRANSLATING',
                max_length=20,
                verbose_name='Статус перекладу'
            ),
        ),
        migrations.AddField(
            model_name='book',
            name='original_status',
            field=models.CharField(
                choices=[
                    ('ONGOING', 'Виходить'),
                    ('STOPPED', 'Припинено'),
                    ('COMPLETED', 'Завершений')
                ],
                max_length=20,
                verbose_name='Статус випуску оригіналу'
            ),
        ),
    ] 