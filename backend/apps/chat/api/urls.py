from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.ChatViewSet, basename='chat')

urlpatterns = [
    path('create/', views.ChatViewSet.as_view({'post': 'create_chat'}), name='create-chat'),
    path('', include(router.urls)),
]