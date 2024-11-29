from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'error-reports', views.ErrorReportViewSet, basename='error-report')

app_name = 'editors'

urlpatterns = [
    path('chapters/<int:chapter_id>/', views.get_chapter_for_edit, name='get-chapter-for-edit'),
    path('chapters/<int:chapter_id>/update/', views.update_chapter, name='update-chapter'),
    path('chapters/update-order/', views.update_chapter_order_no_volume, name='update-chapter-order-no-volume'),
    path('volumes/<int:volume_id>/update-order/', views.update_chapter_order, name='update-chapter-order'),
] + router.urls
