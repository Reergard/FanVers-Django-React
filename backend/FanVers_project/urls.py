from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static

from apps.users.api.views import AuthStatusView
from FanVers_project import settings
from rest_framework import routers, permissions

router = routers.DefaultRouter()

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('apps.api.urls')),
    path('api/auth/', include('djoser.urls')),
    path('api/auth/', include('djoser.urls.jwt')),
    path('auth/', include('djoser.urls.authtoken')),
    path('api/auth-status/', AuthStatusView.as_view(), name='auth-status'),
]

if not settings.IS_PRODUCTION_ENV:
    import debug_toolbar

    urlpatterns += [
        path('', include(router.urls)),
        path('__debug__/', include(debug_toolbar.urls)),
    ] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
