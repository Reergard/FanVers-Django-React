from django.urls import path
from .views import TrendingBooksView, UpdateAnalyticsView

app_name = 'analytics_books'

urlpatterns = [
    path('trending/', TrendingBooksView.as_view(), name='trending_books'),
    path('update/', UpdateAnalyticsView.as_view(), name='update_analytics'),
] 