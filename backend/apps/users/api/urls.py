from django.urls import path
from . import views
from .balance_views import (
    AddBalanceView,
    purchase_chapter,
    update_balance,
    withdraw_balance
)

app_name = 'users'

urlpatterns = [
    # /api/users/...
    path('profile/', views.UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),

    # КОНКРЕТНЫЕ ENDPOINTS ДОЛЖНЫ ИДТИ РАНЬШЕ
    path('profile/upload-image/', views.upload_profile_image, name='upload_profile_image'),
    path('profile/delete-image/', views.delete_profile_image, name='delete_profile_image'),
    path('profile/update-email/', views.UpdateEmailView.as_view(), name='update_email'),
    path('profile/change-password/', views.change_password, name='change_password'),
    path('profile/notification-settings/', views.update_notification_settings, name='notification_settings'),

    path('translators/', views.get_translators_list, name='translators_list'),
    path('add-balance/', AddBalanceView.as_view(), name='add_balance'),
    path('purchase-chapter/<int:chapter_id>/', purchase_chapter, name='purchase_chapter'),
    path('update-balance/', update_balance, name='update-balance'),
    path('become-translator/', views.become_translator, name='become-translator'),
    path('withdraw-balance/', withdraw_balance, name='withdraw-balance'),

    # ЭТОТ — В САМЫЙ НИЗ (динамический маршрут)
    path('profile/<str:username>/', views.get_user_profile, name='user-profile'),
]
