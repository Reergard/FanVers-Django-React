from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views


router = DefaultRouter()


app_name = 'catalog'

urlpatterns = [
    # api/catalog/..
    path('', views.Catalog, name='catalog'),

    path('genres/', views.genres_list, name='genres_list'),
    path('tags/', views.tags_list, name='tags_list'),
    path('countries/', views.countries_list, name='countries_list'),
    path('fandoms/', views.fandoms_list, name='fandoms_list'),

    path('books/create/', views.create_book, name='create_book'),

    path('books/<slug:slug>/', views.book_detail, name='book_detail'),
    path('books/<slug:slug>/add_chapter/', views.add_chapter, name='add_chapter'),
    path('books/<slug:book_slug>/chapters/', views.chapter_list, name='chapter_list'),
    path('books/<slug:book_slug>/chapters/<slug:chapter_slug>/', views.chapter_detail, name='chapter_detail'),
    path('books/<slug:book_slug>/volumes/', views.volume_list, name='volume_list'),
    path('books/<slug:book_slug>/create-volume/', views.create_volume, name='create_volume'),
    path('owned-books/', views.owned_books, name='owned-books'),
] + router.urls
