from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views
from .views import ( ChapterNavigationView, BookmarkViewSet, get_bookmark_status )

# Create a router and register our viewsets with it.
router = DefaultRouter()

router.register(r'bookmarks', BookmarkViewSet, basename='bookmark')
router.register(r'chapters', views.ChapterViewSet, basename='chapter')

app_name = 'navigation'

# The API URLs are now determined automatically by the router.
urlpatterns = [
    # api/navigation/..
    path('books/<slug:book_slug>/chapters/<slug:chapter_slug>/navigation/', ChapterNavigationView.as_view(), name='chapter-navigation'),
    path('bookmarks/status/<int:book_id>/', get_bookmark_status, name='bookmark-status'),
    path('chapters/paginated/', views.ChapterViewSet.as_view({'get': 'paginated_chapters'}), name='paginated-chapters'),
] + router.urls
