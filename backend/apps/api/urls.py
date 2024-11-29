from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    # /api/...
    path('catalog/', include('apps.catalog.api.urls')),
    path('main/', include('apps.main.api.urls')),
    path('search/', include('apps.search.api.urls')),
    path('users/', include('apps.users.api.urls')),
    path('reviews/', include('apps.reviews.api.urls')),
    path('rating/', include('apps.rating.api.urls')),
    path('navigation/', include('apps.navigation.api.urls')), 
    path('chat/', include('apps.chat.api.urls')), 
    path('editors/', include('apps.editors.api.urls')),
    path('notification/', include('apps.notification.api.urls')),
]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


