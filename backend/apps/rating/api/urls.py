from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RatingView


# Create a router and register our viewsets with it.
router = DefaultRouter()
# router.register(r'status', StatusViewSet, basename='status')
# router.register(r'product', ProductViewSet, basename='product')


app_name = 'rating'


urlpatterns = [
    
    path('book/<slug:book_slug>/rating/', RatingView.as_view(), name='book-rating'),
] + router.urls

# api/rating/book/<slug:book_slug>/rating/