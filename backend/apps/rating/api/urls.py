from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BookRatingViewSet


# Create a router and register our viewsets with it.
router = DefaultRouter()
router.register(r'ratings', BookRatingViewSet, basename='ratings')


app_name = 'rating'


urlpatterns = [
     path('', include(router.urls)),
     path('<slug:book_slug>/book-ratings/', 
          BookRatingViewSet.as_view({'get': 'book_ratings'}), 
          name='book-ratings'),
   ] + router.urls

# api/rating/book/<slug:book_slug>/rating/