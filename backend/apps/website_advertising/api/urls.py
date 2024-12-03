from django.urls import path
from .views import AdvertisementViewSet

urlpatterns = [
    # Явные пути для действий
    path('advertisements/calculate_cost/', 
         AdvertisementViewSet.as_view({'post': 'calculate_cost'}), 
         name='calculate-cost'),
         
    path('advertisements/main_page_ads/', 
         AdvertisementViewSet.as_view({'get': 'main_page_ads'}), 
         name='main-page-ads'),
         
    path('advertisements/', 
         AdvertisementViewSet.as_view({'get': 'list', 'post': 'create'}), 
         name='advertisement-list'),
         
    path('advertisements/<int:pk>/', 
         AdvertisementViewSet.as_view({
             'get': 'retrieve',
             'put': 'update',
             'patch': 'partial_update',
             'delete': 'destroy'
         }), 
         name='advertisement-detail'),
]
