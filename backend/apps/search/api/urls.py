from django.urls import path
from .views import BookSearchView

app_name = 'search'

urlpatterns = [
    # /api/search/...
    path('book-search/', BookSearchView.as_view(), name='book-search'),
]
