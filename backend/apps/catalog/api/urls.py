from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import (
    BookOwnerViewSet, BookReaderViewSet,
    genres_list, tags_list, countries_list, fandoms_list,
    add_chapter, chapter_list, chapter_detail, volume_list,
    create_volume, owned_books, delete_chapter, BookInfoView
)

router = DefaultRouter()
router.register(r'books/owner', BookOwnerViewSet, basename='book-owner')
router.register(r'books/reader', BookReaderViewSet, basename='book-reader')

app_name = 'catalog'

urlpatterns = [
    path('genres/', genres_list, name='genres_list'),
    path('tags/', tags_list, name='tags_list'),
    path('countries/', countries_list, name='countries_list'),
    path('fandoms/', fandoms_list, name='fandoms_list'),
    path('books/<slug:slug>/add_chapter/', add_chapter, name='add_chapter'),
    path('books/<slug:book_slug>/chapters/', chapter_list, name='chapter_list'),
    path('books/<slug:book_slug>/chapters/<slug:chapter_slug>/', chapter_detail, name='chapter_detail'),
    path('books/<slug:book_slug>/volumes/', volume_list, name='volume_list'),
    path('books/<slug:book_slug>/create-volume/', create_volume, name='create_volume'),
    path('owned-books/', owned_books, name='owned-books'),
    path('books/<slug:book_slug>/chapters/<int:chapter_id>/delete/', delete_chapter, name='delete_chapter'),
    path('books/info/<slug:slug>/', BookInfoView.as_view(), name='book-info'),
] + router.urls
