from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('notifications', views.NotificationViewSet, basename='notifications')

app_name = 'notification'

urlpatterns = router.urls