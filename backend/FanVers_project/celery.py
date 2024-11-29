from __future__ import absolute_import, unicode_literals
import os
from celery import Celery
from celery.schedules import crontab
import logging


os.environ.setdefault('FORKED_BY_MULTIPROCESSING', '1')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'FanVers_project.settings')
app = Celery('FanVers_project')
app.config_from_object('django.conf:settings', namespace='CELERY')


app.conf.broker_url = 'redis://localhost:6379/0'
app.conf.result_backend = 'redis://localhost:6379/0'

app.autodiscover_tasks()

app.conf.beat_schedule = {
    'update-trending-score': {
        'task': 'catalog.tasks.update_trending_score',
        'schedule': crontab(minute='*/1'),
    },

    'send_abandoned_notification': {
        'task': 'apps.notification.tasks.send_abandoned_notification',
        'schedule': crontab(minute='*/1'),
    },

    'check_abandoned_books': {
        'task': 'apps.notification.tasks.check_abandoned_books',
        'schedule': crontab(minute='*/1'),
    },

    'simple_debug_task': {
        'task': 'catalog.tasks.simple_debug_task',
        'schedule': crontab(minute='*/1'),
    },
}

app.conf.update(
    worker_pool_restarts=True,
    worker_pool='solo',
)
