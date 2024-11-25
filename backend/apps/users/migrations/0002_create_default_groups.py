from django.db import migrations
from django.contrib.auth.models import Group

def create_groups(apps, schema_editor):
    Group.objects.get_or_create(name='Читач')
    Group.objects.get_or_create(name='Перекладач')

def delete_groups(apps, schema_editor):
    Group.objects.filter(name__in=['Читач', 'Перекладач']).delete()

class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_groups, delete_groups),
    ]