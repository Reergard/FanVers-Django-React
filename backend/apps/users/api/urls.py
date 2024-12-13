from django.urls import path
from . import views
from .views import UserProfileView
from .balance_views import (
    AddBalanceView,
    purchase_chapter,
    update_balance,
    withdraw_balance
)

app_name = 'users'


urlpatterns = [
    # /api/users/...
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('profile/update/', views.update_profile_view, name='update_profile'),
    path('translators/', views.get_translators_list, name='translators_list'),
    path('profile/<str:username>/', views.get_user_profile, name='user-profile'),
    path('add-balance/', AddBalanceView.as_view(), name='add_balance'),
    path('purchase-chapter/<int:chapter_id>/', purchase_chapter, name='purchase_chapter'),
    path('update-balance/', update_balance, name='update-balance'),
    path('become-translator/', views.become_translator, name='become-translator'),
    path('withdraw-balance/', withdraw_balance, name='withdraw-balance'),
]
